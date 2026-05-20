# End-to-End Agentic AI QA Workflow

## 📖 About
This repository contains a state-of-the-art, automated Quality Assurance (QA) workflow powered by Playwright and integrated with Agentic AI capabilities. It is designed to demonstrate an intelligent test generation, execution, and reporting pipeline for End-to-End (E2E) testing. 

Currently, the test suite focuses on automating workflows for e-commerce platforms (like SauceDemo), featuring robust validations, multi-browser configurations, and a 7-step autonomous AI-driven QA process.

## 🚀 Features
- **Cross-Browser Testing:** Run tests seamlessly on Chrome, Firefox, and Edge.
- **Advanced Reporting:** Integrated with Allure Reports for visual, detailed execution metrics.
- **Automated Notifications:** Email reporting capabilities using Nodemailer to notify stakeholders after test runs.
- **AI-Driven Infrastructure:** Configured to integrate with AI tools like Ollama and MCP servers for autonomous test generation and self-healing.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Version 16 or higher)
- [Git](https://git-scm.com/)

## 📥 How to Download / Clone This Project

To get a local copy up and running, follow these simple steps:

1. **Clone the repository:**
   Open your terminal (or command prompt) and run:
   ```bash
   git clone https://github.com/saachinwaikaar7777/EndToEndQA.git
   ```

2. **Navigate into the project directory:**
   ```bash
   cd EndToEndQA
   ```

3. **Install NPM Packages:**
   This will install Playwright, Allure, Nodemailer, and other necessary dependencies.
   ```bash
   npm install
   ```

4. **Install Playwright Browsers:**
   Playwright needs to download the necessary browser binaries (Chromium, Firefox, WebKit).
   ```bash
   npx playwright install
   ```

## 🛠️ How to Use & Run Tests

This project includes multiple scripts to make running and debugging tests easier. You can run these commands from your terminal.

### Running Tests
- **Run all E2E tests headlessly (default):**
  ```bash
  npm run test
  ```
- **Run tests in headed mode (UI visible):**
  ```bash
  npm run test:headed
  ```
- **Run the full suite (tests + dashboard + allure report):**
  ```bash
  npm run test:full
  ```
- **Run tests for specific browsers:**
  ```bash
  npm run test:chrome
  npm run test:firefox
  npm run test:edge
  ```

### Reporting & Dashboards
The project generates robust HTML and Allure reports to visualize test execution.
- **Open the latest Playwright HTML report:**
  ```bash
  npm run report:latest
  ```
- **Generate and open the visual Allure report:**
  ```bash
  npm run report:allure-open
  ```
- **Send an automated email with the test report:**
  *(Note: Ensure your SMTP details are correctly configured)*
  ```bash
  npm run report:email
  ```

## 📁 Project Structure Highlights
- `tests/` - Contains all Playwright E2E test specifications.
- `scripts/` - Custom Node.js scripts for dashboard generation and email notifications.
- `playwright.config.ts` - Core Playwright configuration file setting up timeouts, browsers, and reporters.
- `email_id.md` - Stores configuration related to email recipients for automated test reporting.
