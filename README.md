EHR Dashboard Integration

During the development of this project, the following APIs were considered but ultimately, mock API responses using Postman were used:
1.	Oracle Health EHR API - 
o	The API is read-only and requires application approval, which is a paid process.
2.	PracticeFusion FHIR API - 
o	Access requires partner registration, and the approval process can take up to 10 days. Additionally, I found out it was only available for US-based users, so I could not obtain credentials.
Alternative Approach:
After consulting with Saumik, I decided to proceed using Postman Mock Servers to simulate API responses. This allowed me to continue development without waiting for API access.
________________________________________
Implementation:

This EHR Dashboard project is built entirely using Next.js with React and Tailwind CSS, written in TypeScript. 
I have exposed .env which just contains the URL for mock Api
•	Postman Mock API:
Created a Postman collection with mock responses for patients and appointments.
•	Functionalities Implemented:
1.	Patient Management:
	Get a list of patients using search by name or ID.
	Returns patient personal records, contact details, medical history, and allergies.
	Added Debouncing for Search optimization.
2.	Appointments:
	Retrieve all appointments.
	Search appointments by date and time.
•	Application Sections:
1.	Dashboard: Displays previews and basic details of patients and appointments.
2.	Patient List: Shows all patients along with detailed personal and medical information.
3.	Appointments: Lists all appointments with search functionality by date and time.
•	Limitations:
o	Since the APIs are mocked, the application does not support creating, updating, or deleting records.
o	Only search and retrieval functionalities are implemented due to time constraints.
o	The application is not a fully functional CRUD system.
