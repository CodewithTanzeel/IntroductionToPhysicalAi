<!--
Sync Impact Report:
Version change: 0.0.0 -> 1.0.0 (Major bump due to complete content replacement)
Modified principles: All principles are new.
Added sections: Purpose, Scope, Architecture, Development Principles, RAG Chatbot Integration, Contribution Rules, Acceptance Criteria.
Removed sections: All previous templated sections.
Templates requiring updates:
- .specify/templates/plan-template.md: ⚠ pending (Constitution Check section needs manual update)
- .specify/templates/spec-template.md: ⚠ pending (Scope/requirements alignment needs manual update)
- .specify/templates/tasks-template.md: ⚠ pending (Task categorization needs manual update)
- .gemini/commands/sp.adr.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.analyze.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.checklist.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.clarify.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.constitution.toml: ✅ updated (This command itself is being used)
- .gemini/commands/sp.git.commit_pr.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.implement.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.phr.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.plan.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.specify.toml: ✅ updated (No specific changes needed, general guidance)
- .gemini/commands/sp.tasks.toml: ✅ updated (No specific changes needed, general guidance)
Follow-up TODOs: None.
-->
# Project Constitution — Introduction to Physical AI Documentation

This project establishes a unified structure for creating an interactive documentation website on **Introduction to Physical AI** using **Docusaurus**, **Spec-Kit-Plus**, and **Gemini CLI**. All content must be clear, consistent, test-driven, and technically accurate.

---

## 1. Purpose

The purpose of this project is to develop a complete, accessible, and interactive educational resource that introduces the core concepts of **Physical AI**, including embodiment, perception, action, robotics foundations, environmental interaction, and safety. The documentation must support searchability, modular navigation, and AI-augmented learning through a RAG-powered chatbot.

---

## 2. Scope

The documentation will cover:

* Fundamentals of Physical AI
* Embodied intelligence and perception–action loops
* Sensors, actuators, and physical reasoning
* Mathematical foundations and environment interaction
* Real-world applications and safety considerations
* A fully integrated RAG chatbot trained on the documentation

---

## 3. Architecture

The system will use:

* **Docusaurus** for documentation pages
* **Spec-Kit-Plus** for structure and conventions
* **Gemini CLI** for assisted authoring
* **Vector Database + Gemini LLM** for the RAG chatbot
  All documentation must be written in **Markdown/MDX** and stored within the `/docs/physical-ai/` directory.

---

## 4. Development Principles

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

## 5. RAG Chatbot Integration

A chatbot will be included in the documentation website. It must:

* Use Gemini LLM for reasoning
* Retrieve context from embedded markdown files
* Provide accurate, citation-grounded responses
* Include a simple UI component accessible across the site

---

## 6. Contribution Rules

* Pair programming with Gemini CLI is recommended.
* All commits must follow **Conventional Commits**.
* Every change requires passing tests and peer review.
* Documentation must remain concise, factual, and consistent with project goals.

---

## 7. Acceptance Criteria

The project is considered complete when:

* All Physical AI chapters are written and validated
* The RAG chatbot retrieves and answers correctly
* All TDD tests pass with no structural errors
* Docusaurus builds successfully without warnings

**Version**: 1.0.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07