from openai import OpenAI, APIError
import streamlit as st
import generator
import subprocess
import threading
import webbrowser
import duckdb
import os

# Function to create a MotherDuck connection
@st.cache_resource
def get_motherduck_connection():
    return duckdb.connect(database='md:', read_only=False)

# Function to create a OpenRouter client
@st.cache_resource
def get_openrouter_client():
    return OpenAI(
        api_key = os.getenv('OPENROUTER_API_KEY'),
        base_url = 'https://openrouter.ai/api/v1'
    )
# Function to run npm run dev in the background
def run_npm_dev():
    subprocess.Popen(['npm', 'run', 'dev'], cwd='my-app/', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, universal_newlines=True)

# Function to open the app in a new tab
def open_app():
    webbrowser.open_new_tab('http://localhost:5173')

# Function to get list of databases
@st.cache_resource
def get_databases():
    result = conn.execute("SHOW ALL DATABASES").fetchall()
    return [db[0] for db in result]

# Function to get schema of selected database
def get_database_schema(database_name):
    conn.execute(f"USE {database_name}")
    schema_res = conn.execute("SELECT array_to_string(list(sql), '\n') from duckdb_tables() WHERE database_name = ?", [database_name]).fetchone()
    if schema_res is None:
        return ""
    return schema_res[0]

def write_cursor_file(database_schema):
    with open("my-app/.cursorrules", "w+") as f:
        f.write(generator.cursor_prompt.format(database_schema=database_schema))

client = get_openrouter_client()
conn = get_motherduck_connection()

# Initialize session state variables
if 'is_app_running' not in st.session_state:
    st.session_state.is_app_running = False
if 'show_open_app' not in st.session_state:
    st.session_state.show_open_app = False
if 'selected_database' not in st.session_state:
    st.session_state.selected_database = None
if 'database_schema' not in st.session_state:
    st.session_state.database_schema = None
if 'generated_first_component' not in st.session_state:
    st.session_state.generated_first_component = False
if 'error_state' not in st.session_state:
    st.session_state.error_state = None

st.title("MotherDuck Data App Generator")

# Add sidebar with usage information
st.markdown(
    """
    <style>
        section[data-testid="stSidebar"] {
            width: 40% !important;
        }
    </style>
    """,
    unsafe_allow_html=True,
)
st.sidebar.title("How to Use the Generator")
st.sidebar.info("""
### To build apps effectively

1. Start with a basic version of your app.
2. Build iteratively by adding new features one at a time.
3. Be specific in your requests for each iteration.
4. Review and test each change before moving to the next.
5. If something isn't working as expected, provide the error messages to the agent for troubleshooting.
6. Complex apps are built step by step. Take your time and enjoy the process!

### Troubleshooting 
- Check for errors in the UI and the Browser console.
- Check the browser console (F12 > Console) for JavaScript errors.
- If you encounter UI issues, describe them to the agent.

### Continue in Cursor
We create a .cursorrules file in the my-app folder containing your schema information and MotherDuck Data App specific instructions.

1. Open the my-app project in [Cursor](https://cursor.sh).
2. Go to Settings -> General in Cursor and make sure 'Include .cursorrules file' is activated.
4. Choose your preferred coding assistant model. We recommend using anthropic/claude-3.5-sonnet.
5. You can now continue coding in Cursor.
""")

# Database selection dropdown
databases = get_databases()
selected_db = st.selectbox("Select a database", databases, index=0)

if selected_db is not None and selected_db != st.session_state.selected_database:
    st.session_state.selected_database = selected_db
    st.session_state.database_schema = get_database_schema(selected_db)
    st.success(f"Connected to database: {selected_db}")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if "messages_internal" not in st.session_state:
    st.session_state.messages_internal = []
    st.session_state.messages_internal.append({"role": "system", "content": generator.generator_prompt})

if prompt := st.chat_input("What can I do for you?"):
    st.session_state.messages.append({"role": "user", "content": prompt})

    # Append database schema to the prompt
    if st.session_state.database_schema:
        if not st.session_state.generated_first_component:
            context_prompt = f"Here's the schema of the selected database: \n{st.session_state.selected_database} \nAlways prepend the database name to the table name when you generate queries ({st.session_state.selected_database}.<table_name>):\n{st.session_state.database_schema}\n\nUser instruction: {prompt}"
        else:
            context_prompt = f"User instruction: {prompt}"
        write_cursor_file(st.session_state.database_schema)
    else:
        context_prompt = prompt
    st.session_state.messages_internal.append({"role": "user", "content": context_prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    response = ""

    if not st.session_state.generated_first_component:
        spinner_text = "Generating app, please wait..."
        st.session_state.generated_first_component = True
    else:
        spinner_text = "Updating app, please wait..."

    # Show spinner while generating the code
    with st.spinner(spinner_text):
        # extract myapp.tsx
        completion = client.chat.completions.create(
            extra_headers = {
                "HTTP-Referer": "https://motherduck.com/",
                "X-Title": "MotherDuck Data App Generator"
            },
            model="anthropic/claude-3.5-sonnet",
            messages=[
                {"role": m["role"], "content": m["content"]}
                for m in st.session_state.messages_internal
            ],
            timeout=90
        )

        response = completion.choices[0].message.content
        print(response)
        st.session_state.messages_internal.append({"role": "user", "content": response})

        # write to MyApp.tsx
        clean_text, component_code = generator.extract_component(response)
        if component_code != "":
            with open("my-app/src/components/MyApp.jsx", "w+") as f:
                f.write(component_code)
            # Run npm run build
            try:
                result = subprocess.run(['npm', 'run', 'build'], cwd='my-app/', capture_output=True, text=True, check=True)
                print("npm run build output:", result.stdout)
                # Show the "Open App" button when new code is written
                st.session_state.show_open_app = True
            except subprocess.CalledProcessError as e:
                error_message = f"Error running npm run build: {e.stderr}"
                print(error_message)
                st.session_state.messages_internal.append({"role": "user", "content": "I encountered an error with the following message, please fix it: " + error_message})
                # Display error message in the UI
                st.session_state.error_state = f"An error occurred during the build process: {error_message}. \nDo you want me to fix it?"
                st.session_state.show_open_app = False

    with st.chat_message("assistant"):
        try:
            stream = client.chat.completions.create(
                extra_headers = {
                    "HTTP-Referer": "https://motherduck.com/",
                    "X-Title": "MotherDuck Data App Generator"
                },
                model="anthropic/claude-3.5-sonnet",
                messages=[
                    {"role": m["role"], "content": m["content"]}
                    for m in st.session_state.messages+[{"role": "assistant", "content": response}, {"role": "user", "content": "Summarize the changes you have done in one sentence"}]
                ],
                stream=True,
                timeout=60
            )
            response = st.write_stream(stream)
            st.session_state.messages.append({"role": "assistant", "content": response})
            if st.session_state.error_state:
                st.error(st.session_state.error_state)
                st.session_state.error_state = None

        except APIError as e:
            st.error(f"An error occurred while communicating with the API: {str(e)}")
            st.info("Please try again later or contact support if the problem persists.")

# "Open App" button
if st.session_state.show_open_app:
    if st.button("Open App"):
        open_app()

if not st.session_state.is_app_running:
    st.session_state.npm_thread = threading.Thread(target=run_npm_dev)
    st.session_state.npm_thread.start()
    st.session_state.is_app_running = True
