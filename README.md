# **DataClean Analyzer**

DataClean Analyzer is a web-based tool that allows users to upload CSV or Excel files and automatically clean, analyze, and summarize the data. The app provides a data preview, highlights missing values, calculates basic statistics, identifies common patterns, and offers downloadable cleaned datasets. It also supports dark mode for better usability.

## **Features**

1. Upload CSV or Excel files for analysis.

2. Automatic cleaning of numeric and text data:

3. Handles missing values.

4. Detects and replaces outliers in numeric columns.

5. Provides summary statistics: Total rows, cleaned rows, rows removed, and missing values.

6. Data Insights: 
   1. Most common categories in text columns.
   2. verage values for numeric columns.

7. Data preview table showing first few rows

8. Download cleaned CSV.

9. Optional visualization plots for numeric and categorical data.
    
## **Custom Functionality (Written by Me):**

**Most Common Category: For each text column, the function calculates the value that appears most frequently and the number of times it occurs. This gives users a quick understanding of dominant trends in categorical data.**

**Example: Department: Sales (24 times) indicates that "Sales" appears 24 times in the Department column.**

**Technology Stack**

Backend: FastAPI, pandas, matplotlib

Frontend: React

Communication: REST API with Axios

## **How It Works**

User uploads a CSV or Excel file.

Backend processes the file:

Cleans missing or invalid values.

Handles numeric outliers.

Applies the custom “Most Common Category” logic.

Backend sends cleaned data, statistics, and insights to the frontend.

Frontend displays data preview, insights, and visualizations.

User can download the cleaned file.



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
