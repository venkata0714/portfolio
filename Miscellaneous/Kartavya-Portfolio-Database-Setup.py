from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# MongoDB setup
uri = "Shhh!"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["KartavyaPortfolioDB"]

# Define a function to gather user input for images, paragraphs, and URLs
def get_input_list(prompt):
    count = input(f"How many {prompt} are you adding? ")
    while count == "":
        count = input(f"How many {prompt} are you adding? ")
    return [input(f"Enter {prompt} {i + 1}: ") for i in range(int(count))]

# Define a function to gather all required data from user
def get_data(collection_name):
    data = {}

    # Title
    data[f"{collection_name}Title"] = input("Enter the Title: ")
    
    # Generate link based on title
    data[f"{collection_name}Link"] = '-'.join(data[f"{collection_name}Title"].split()).lower()
    print(f"Generated Link: {data[f'{collection_name}Link']}")

    # Images
    data[f"{collection_name}Images"] = get_input_list("image links")

    # Subtitle (optional)
    data[f"{collection_name}SubTitle"] = input("Enter the Subtitle (optional, press Enter to skip): ")

    # Timeline
    data[f"{collection_name}Timeline"] = input("Enter the Timeline: ")

    # Tagline
    data[f"{collection_name}Tagline"] = input("Enter a short tagline: ")

    # Paragraphs
    data[f"{collection_name}Paragraphs"] = get_input_list("paragraphs")

    # URLs
    data[f"{collection_name}URLs"] = get_input_list("URLs")

    return data

# Main function to select collection and insert data
def main():
    print("Select the type of data you want to add:")
    print("1. Project")
    print("2. Involvement")
    print("3. Experience")
    print("4. Honors Experience")
    print("5. Year In Review")
    
    choice = input("Enter the number corresponding to your choice: ")
    
    if choice == "1":
        collection = db["projectTable"]
        collection_name = "project"
    elif choice == "2":
        collection = db["involvementTable"]
        collection_name = "involvement"
    elif choice == "3":
        collection = db["experienceTable"]
        collection_name = "experience"
    elif choice == "4":
        collection = db["honorsExperienceTable"]
        collection_name = "honorsExperience"
    elif choice == "5":
        collection = db["yearInReviewTable"]
        collection_name = "yearInReview"
    else:
        print("Invalid choice.")
        return
    
    # Gather data and insert into the selected collection
    data = get_data(collection_name)
    collection.insert_one(data)
    print(f"Data successfully inserted into {collection_name}Table.")

# Run the main function
if __name__ == "__main__":
    count = int(input("How many Entries are you adding? "))
    for i in range(count):
        print(f"\nAdding New Entry {i + 1}")
        main()