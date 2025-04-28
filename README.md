# Minimal Project Groups

### How to install and run the project

- Make sure your terminal's **current working directory is this project's root directory**.

- If this is your first time running this script, please initialise node and install express using your package manager of choice:

  ```
  npm init
  ```

  ```
  npm i express
  ```

- To run the script, use node:

  ```
  node .
  ```

  To terminate the script, simply close the terminal instance you ran the script in.

---

### How to use the API

- Open your API platform of choice (e.g. Postman).

- Send a POST request to http://localhost:8080/groups with a body like in these examples:

  ```json
  {
    "requiredAreas": ["l", "q", "s"]
  }
  ```

  ```json
  {
    "requiredAreas": ["a", "b", "d", "e", "i", "l", "n", "o", "r", "s", "t"]
  }
  ```

  The respone will be a 2-dimensional array of combinations of employees who are all essential in their respective groups.
