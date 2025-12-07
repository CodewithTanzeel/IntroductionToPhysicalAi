Here is a **clean, single-page, text-only Constitution** in **Markdown format** — short, concise, and ready for your `/sp.constitution.md` file.

---

# **Project Constitution — Introduction to Physical AI Documentation**

This project establishes a unified structure for creating an interactive documentation website on **Introduction to Physical AI** using **Docusaurus**, **Spec-Kit-Plus**, and **Gemini CLI**. All content must be clear, consistent, test-driven, and technically accurate.

---

## **1. Purpose**

The purpose of this project is to develop a complete, accessible, and interactive educational resource that introduces the core concepts of **Physical AI**, including embodiment, perception, action, robotics foundations, environmental interaction, and safety. The documentation must support searchability, modular navigation, and AI-augmented learning through a RAG-powered chatbot.

---

## **2. Scope**

The documentation will cover:

* Fundamentals of Physical AI
* Embodied intelligence and perception–action loops
* Sensors, actuators, and physical reasoning
* Mathematical foundations and environment interaction
* Real-world applications and safety considerations
* A fully integrated RAG chatbot trained on the documentation

---

## **3. Architecture**

The system will use:

* **Docusaurus** for documentation pages
* **Spec-Kit-Plus** for structure and conventions
* **Gemini CLI** for assisted authoring
* **Vector Database + Gemini LLM** for the RAG chatbot
  All documentation must be written in **Markdown/MDX** and stored within the `/docs/physical-ai/` directory.

---

## **4. Development Principles**

This project follows **Test-Driven Development (TDD)** for documentation and features.
Before creating any chapter or feature:

1. Define test expectations.
2. Write validation tests for structure and accuracy.
3. Generate or write the content to satisfy the tests.
   All markdown files must contain:

* One H1 heading
* At least two H2 sections
* Clear definitions of key terms

---

## **5. RAG Chatbot Integration**

A chatbot will be included in the documentation website. It must:

* Use Gemini LLM for reasoning
* Retrieve context from embedded markdown files
* Provide accurate, citation-grounded responses
* Include a simple UI component accessible across the site

---

## **6. Contribution Rules**

* Pair programming with Gemini CLI is recommended.
* All commits must follow **Conventional Commits**.
* Every change requires passing tests and peer review.
* Documentation must remain concise, factual, and consistent with project goals.

---

## **7. Acceptance Criteria**

The project is considered complete when:

* All Physical AI chapters are written and validated
* The RAG chatbot retrieves and answers correctly
* All TDD tests pass with no structural errors
* Docusaurus builds successfully without warnings


