from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# MongoDB setup
uri = "Shhh!"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["KartavyaPortfolioDB"]

# Function to add a single skill entry
def add_skill(skill_data):
    try:
        skills_table = db["skillsTable"]
        result = skills_table.insert_one(skill_data)
        print(f"Skill added with ID: {result.inserted_id}")
    except Exception as e:
        print(f"An error occurred while adding the skill: {e}")

# Function to add multiple skills
def add_multiple_skills(skill_data_list):
    try:
        skills_table = db["skillsTable"]
        result = skills_table.insert_many(skill_data_list)
        print(f"Skills added with IDs: {result.inserted_ids}")
    except Exception as e:
        print(f"An error occurred while adding the skills: {e}")

# Data to be inserted (givenData)
skills_data = [
    {
        "Labels": ["Problem Solving", "Data Analysis", "Flexibility", "Efficiency", "Optimization"],
        "Scores": [4.9, 4.8, 4.7, 4.5, 4.8],
        "skillTitle": "Python",
        "skillDescription": "Expert in Python with proficiency in data manipulation and algorithm design.",
    },
    {
        "Labels": ["Model Building", "Data Processing", "Algorithm Design", "Evaluation", "Deployment"],
        "Scores": [4.8, 4.7, 4.8, 4.5, 4.6],
        "skillTitle": "Machine Learning",
        "skillDescription": "Adept at designing and deploying machine learning models for practical applications.",
    },
    {
        "Labels": ["Frontend Design", "Backend Logic", "API Integration", "Responsiveness", "User Experience"],
        "Scores": [4.7, 4.6, 4.8, 4.5, 4.7],
        "skillTitle": "Web Development",
        "skillDescription": "Skilled in creating full-stack web applications with seamless frontend-backend integration.",
    },
    {
        "Labels": ["PowerBI", "Tableau", "Chart.js", "Clarity", "Insight Extraction"],
        "Scores": [4.7, 4.6, 4.8, 4.5, 4.7],
        "skillTitle": "Data Visualization",
        "skillDescription": "Experienced in crafting interactive and informative data visualizations for impactful insights.",
    },
    {
        "Labels": ["Deployment", "Scalability", "Security", "Efficiency", "Cost Optimization"],
        "Scores": [4.6, 4.5, 4.7, 4.4, 4.5],
        "skillTitle": "Cloud Computing",
        "skillDescription": "Proficient in deploying secure and scalable cloud-based solutions using modern tools.",
    },
    {
        "Labels": ["Natural Language Processing", "Deep Learning", "Automation", "Innovation", "Real-world Impact"],
        "Scores": [4.8, 4.7, 4.9, 4.6, 4.8],
        "skillTitle": "Artificial Intelligence",
        "skillDescription": "Passionate about applying AI for innovative and impactful real-world solutions.",
    },
]


# Insert the data
if __name__ == "__main__":
    add_multiple_skills(skills_data)
