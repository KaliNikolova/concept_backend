# Project Reflection: Building "Current"

This project was a comprehensive journey through the modern software development lifecycle, from conceptualization to deployment. The structured approach of the course, breaking down the process into distinct phases - ideation, planning, backend concept implementation, frontend development, and final integration - was instrumental in making a complex task feel manageable and achievable.

### What Went Well and What Was Challenging

*   One of the most positive outcomes is having a fully functional, deployed application. I started this course with no prior experience in UI/UX or frontend development, yet thanks to the clear separation of concerns between the backend concepts and the power of an agentic coding tool like Cursor, this knowledge gap was not an obstacle. It was empowering to see how quickly a visually pleasing and functional interface could be built on a solid backend foundation.

*  Large Language Models were a tremendous asset for accelerating development, particularly in scaffolding the entire frontend structure. The initial setup was incredibly fast. However, this speed came at a cost during the debugging phase. Debugging LLM-generated code felt like trying to fix someone else’s work; it was difficult to trace the logic, and "vibe debugging" - making small, intuitive changes - proved ineffective. The models often struggled to isolate a specific problem and apply a fix consistently and efficiently across the codebase.

### Mistakes and Future Improvements

My biggest mistake was not adequately researching ready-to-use components before trying to build them myself. I spent significant time attempting to create custom calendar and time-picker components from scratch, only to realize that professionally designed components from a library like Vuetify were far more robust and easier to implement.

In the future, I will dedicate more time to upfront frontend planning. Before writing any code, I plan to create a more extensive layout of the UI. I intend to use tools like Gemini in AI Studio or the Context tool to help brainstorm and structure this design, including design files directly in the frontend repository for Cursor to reference. This will ensure I leverage existing solutions and build a more coherent interface from the start.

### Skills Acquired and Areas for Growth

This project was a fantastic learning experience. I acquired practical skills in:
*   **Modularity and Separation of Concerns**: Designing self-contained concepts for the backend.
*   **New Technologies**: Working with Deno for the backend and Vue.js for the frontend, along with foundational HTML and CSS.
*   **AI-Powered Development**: Becoming more proficient at prompting LLMs to generate useful code and documentation.
*   **Full-Stack Architecture**: Gaining a holistic understanding of how servers, APIs, and frontends interact.

However, the reliance on "vibe coding" with an LLM has highlighted an area for further development. While it's effective for getting things done quickly, it can tempt you to bypass learning how to write clean, efficient code from first principles. Moving forward, I want to focus on strengthening my core programming skills to ensure I am the architect of my code, not just a prompter.

### How I Used the Development Tools

*   **Context Tool**: My primary use for the Context tool was on the backend. It was invaluable for generating and debugging the isolated concepts and syncs. It also served as a central hub for managing design documents and ensuring that the implementation of each concept aligned with its specification.

*   **Agentic Coding Tool (Cursor)**: Cursor was the cornerstone of my frontend development. I used it for everything: generating the initial file structure, creating components, adding features, debugging, and tailoring the frontend to communicate with the backend API endpoints. In the later stages, I also used it for backend tasks like generating authentication syncs, creating the API specification, and drafting design documents.

### Conclusions on the Role of LLMs in Software Development

My experience leads me to believe that LLMs are powerful force multipliers, but not autonomous developers. Their appropriate role is as a highly efficient assistant, not a project lead.

*   **Execution over Strategy**: LLMs excel at executing small, well-defined tasks but are not yet capable of high-level project planning or solving complex, multi-faceted problems. The developer’s most crucial role is to break down large goals into precise, actionable prompts.

*   **The Importance of Human Verification**: Trusting LLM output blindly is a recipe for subtle, hard-to-find bugs. I learned that I needed to carefully review the generated code for core components myself. Providing the LLM with my own test cases was the most effective way to ensure a concept was implemented exactly as I intended.

*   **Backend as the Bedrock**: This project reinforced the idea that a well-managed backend is more critical than the frontend, as it establishes the fundamental architecture and rules for how the entire application operates. An LLM can help build it, but the developer must own the design.