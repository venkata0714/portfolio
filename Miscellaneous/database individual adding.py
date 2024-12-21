from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# MongoDB setup
uri = "Hmmm!"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["KartavyaPortfolioDB"]

# Function to add a single skill entry
def add_skill(skill_data):
    try:
        skills_table = db["skillsCollection"]
        result = skills_table.insert_one(skill_data)
        print(f"Skill added with ID: {result.inserted_id}")
    except Exception as e:
        print(f"An error occurred while adding the skill: {e}")

# Function to add multiple skills
def add_multiple_skills(skill_data_list):
    try:
        skills_table = db["skillsCollection"]
        result = skills_table.insert_many(skill_data_list)
        print(f"Skills added with IDs: {result.inserted_ids}")
    except Exception as e:
        print(f"An error occurred while adding the skills: {e}")

# Data to be inserted (givenData)
skill_categories = [
    {
        "title": "Programming & Development",
        "description": "Showcasing expertise in modern programming languages and frameworks.",
        "skills": [
            {"logo": "javascript", "name": "JavaScript", "proficiency": "proficient"},
            {"logo": "python", "name": "Python", "proficiency": "proficient"},
            {"logo": "cpp", "name": "C++", "proficiency": "proficient"},
            {"logo": "typescript", "name": "TypeScript", "proficiency": "intermediate"},
            {"logo": "c", "name": "C", "proficiency": "intermediate"},
            {"logo": "java", "name": "Java", "proficiency": "intermediate"},
            {"logo": "go", "name": "Go", "proficiency": "beginner"},
        ],
    },
    {
        "title": "Full Stack Development",
        "description": "Experience with robust front-end and back-end technologies.",
        "skills": [
            {"logo": "mongodb", "name": "MongoDB", "proficiency": "proficient"},
            {"logo": "express", "name": "Express", "proficiency": "proficient"},
            {"logo": "react", "name": "React", "proficiency": "proficient"},
            {"logo": "nodejs", "name": "Node JS", "proficiency": "proficient"},
            {"logo": "flask", "name": "Flask", "proficiency": "proficient"},
            {"logo": "css", "name": "CSS", "proficiency": "proficient"},
            {"logo": "framermotion", "name": "Framer Motion", "proficiency": "intermediate"},
            {"logo": "angular", "name": "AngularJS", "proficiency": "beginner"},
        ],
    },
    {
        "title": "Data & AI",
        "description": "Specialized in data manipulation, machine learning, and AI frameworks.",
        "skills": [
            {"logo": "tensorflow", "name": "TensorFlow", "proficiency": "proficient"},
            {"logo": "sklearn", "name": "Logistic Regression", "proficiency": "proficient"},
            {"logo": "d3", "name": "D3", "proficiency": "proficient"},
            {"logo": "sql", "name": "SQL", "proficiency": "proficient"},
            {"logo": "matplotlib", "name": "Matplotlib", "proficiency": "intermediate"},
            {"logo": "pyspark", "name": "PySpark", "proficiency": "beginner"},
            {"logo": "hive", "name": "Hive", "proficiency": "beginner"},
        ],
    },
    {
        "title": "Tools & Platforms",
        "description": "Proficient with industry-standard tools and platforms.",
        "skills": [
            {"logo": "powerbi", "name": "Power BI", "proficiency": "proficient"},
            {"logo": "windows", "name": "Windows", "proficiency": "proficient"},
            {"logo": "macos", "name": "MacOS", "proficiency": "proficient"},
            {"logo": "ms_office", "name": "MS Office", "proficiency": "intermediate"},
            {"logo": "labview", "name": "LabView", "proficiency": "intermediate"},
            {"logo": "tableau", "name": "Tableau", "proficiency": "beginner"},
            {"logo": "unity", "name": "Unity", "proficiency": "beginner"},
            {"logo": "kali", "name": "Kali Systems", "proficiency": "beginner"},
            {"logo": "linux", "name": "Linux", "proficiency": "beginner"},
        ],
    },
    {
        "title": "Spoken Language",
        "description": "Bi-lingual by birth and always eager to learn more.",
        "skills": [
            {"logo": "english", "name": "English", "proficiency": "proficient"},
            {"logo": "hindi", "name": "Hindi", "proficiency": "proficient"},
            {"logo": "japanese", "name": "Japanese", "proficiency": "intermediate"},
            {"logo": "french", "name": "French", "proficiency": "intermediate"},
            {"logo": "arabic", "name": "Arabic", "proficiency": "beginner"},
        ],
    },
]

# Insert the data
if __name__ == "__main__":
    add_multiple_skills(skill_categories)
