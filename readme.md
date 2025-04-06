# Q&A Frontend (Vanilla JavaScript)

This is the frontend client for a simple Q\&A application, built using plain HTML, CSS, and vanilla JavaScript. It interacts with a backend API to display and manage questions and answers.

## Project Structure

your_project_root/
├── index.html           # Homepage displaying the list of questions
├── css/
│   └── style.css        # Basic styling for the application
└── js/
└── script.js        # JavaScript logic for API interaction and DOM manipulation
└── questions/
└── new.html       # Form for creating new questions
└── README.md            # This file


## Deployment to GitHub Pages

This guide assumes you have your frontend code in a GitHub repository. Here's how to deploy it using GitHub Pages:

1.  **Ensure your project structure is as shown above.** GitHub Pages typically serves content from the root of your repository or a specific folder (like `/docs` or a branch like `gh-pages`). The structure above is suitable for deploying from the root.

2.  **Commit and push your code to your GitHub repository.** Make sure all your HTML, CSS, and JavaScript files are included in the repository.

3.  **Enable GitHub Pages:**
    * Go to your repository on GitHub.
    * Click on the **Settings** tab.
    * In the left sidebar, scroll down and click on **Pages**.
    * Under the "Source" section, select the branch you want to deploy from (usually `main` or `master`).
    * If your HTML files are in the root of your repository, select "root" as the folder. If they are in a specific folder (e.g., `/public`), select that folder.
    * Click **Save**.

4.  **Your site will be published at a URL similar to `https://<your-github-username>.github.io/<your-repository-name>/`** (if deploying from the root of the `main` branch). It might take a few minutes for the site to become live.

## Configuration (Backend API URL)

After deploying your frontend, you need to update the `apiUrl` variable in your `js/script.js` file to point to your deployed backend API URL (e.g., `https://quesansapi.deno.dev`).

1.  **Edit `js/script.js`:** Open the `js/script.js` file in your local project.
2.  **Locate the `apiUrl` constant:**
    ```javascript
    const apiUrl = 'YOUR_DEPLOYED_API_URL'; // *** REPLACE THIS WITH YOUR ACTUAL DEPLOYED API URL ***
    ```
3.  **Replace `'YOUR_DEPLOYED_API_URL'` with the actual URL of your deployed Q\&A API.** For example:
    ```javascript
    const apiUrl = '[https://quesansapi.deno.dev](https://quesansapi.deno.dev)';
    ```
4.  **Commit and push the updated `js/script.js` file to your GitHub repository.** This will trigger an update to your deployed frontend on GitHub Pages.

## Important Notes

* GitHub Pages is designed for static content. Your HTML, CSS, and JavaScript files will be served directly by GitHub's servers.
* The API calls from your frontend will be made directly from the user's browser to your backend API. Ensure your backend API is configured to handle requests from the origin of your GitHub Pages site (as discussed regarding CORS).
* For more complex frontend deployments or if you need server-side rendering or build processes, consider using other hosting platforms like Netlify or Vercel, which offer more features.

Now your Q\&A frontend should be accessible via your GitHub Pages URL, and it will communicate with your deployed backend API. Remember to configure the CORS settings in your backend API to allow requests from your GitHub Pages origin.
Explanation of the README Content:

Description: Briefly explains what the project is.
Project Structure: Provides a clear overview of the important files and folders in your frontend project. This helps others (and your future self) understand the organization.
Deployment to GitHub Pages: Gives step-by-step instructions on how to deploy a static website to GitHub Pages. This is a common and free way to host simple frontends.
Configuration (Backend API URL): Highlights the crucial step of updating the API URL in your JavaScript code after deployment so that the frontend knows where to send its requests.
Important Notes: Includes key considerations for using GitHub Pages and the interaction with your backend API, especially regarding CORS.