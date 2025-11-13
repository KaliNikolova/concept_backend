# Current

**Current** is a task management application designed to help users overcome procrastination and task paralysis by providing a clear focus on the immediate task. Instead of overwhelming users with a long to-do list, Current helps them plan their day and focus on what matters right now.

## Overview

Current helps users:
- **Manage tasks** with details like title, description, due dates, and estimated durations
- **Plan their day** by intelligently scheduling tasks around blocked time and working hours
- **Stay focused** by highlighting the current task they should be working on

The application features a "My Tasks" view for task management and a "Day Plan" view for scheduling and execution, creating a clear separation between planning and doing.

## Design Document

For a detailed overview of the project's evolution, design decisions, and development journey, see:

**[📄 Design Document](design/design.md)**

This document outlines how Current evolved from its initial concept to the final implementation, including the rationale behind key design choices.

## Project Reflection

For insights into the development process, challenges faced, and lessons learned, see:

**[📝 Project Reflection](design/reflection.md)**

This reflection covers the development journey, use of LLMs and development tools, and conclusions on building a full-stack application.

## Demo Video

Watch a demonstration of Current in action:

**[🎥 Demo Video](media/video-4c.mp4)**

The backend action trace from this demo is available in [media/video-4c-trace.txt](media/video-4c-trace.txt).

## Tech Stack

- **Backend**: Deno + TypeScript
- **Database**: MongoDB Atlas
- **Architecture**: Concept-based design pattern
- **Deployment**: Render (backend) + Render (frontend static site)

## Concepts

Current implements the following concepts:

- **UserAccount**: User authentication and profile management
- **Tasks**: Task creation, editing, completion, and organization
- **Schedule**: Time blocking and calendar management
- **Planner**: Intelligent day planning that schedules tasks around constraints
- **Focus**: Current task highlighting based on the generated schedule

## Setup

### Prerequisites

1. **Install Deno**: [Install from Deno's website](https://deno.com)
2. **MongoDB Atlas**: Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
3. **Gemini API Key**: For Context tool (optional, for development)

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=current
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-pro
GEMINI_CONFIG=./geminiConfig.json
```

### Running Locally

1. **Start the backend server**:
   ```shell
   deno task start
   ```

2. **Run tests**:
   ```shell
   deno test -A
   ```

3. **Build concepts** (if needed):
   ```shell
   deno task build
   ```

## Development

### Project Structure

```
├── src/
│   ├── concepts/          # Concept implementations
│   │   ├── UserAccount/   # User authentication
│   │   ├── Tasks/         # Task management
│   │   ├── Schedule/      # Time blocking
│   │   ├── Planner/       # Day planning
│   │   └── Focus/         # Current task focus
│   ├── syncs/             # Synchronizations between concepts
│   └── main.ts            # Entry point
├── design/                # Design documents and specs
└── context/              # Context tool history (immutable)
```

### Using Context Tool

This project uses the Context tool for design documentation and LLM collaboration. To compile the Context binary:

```shell
deno compile -A --output ctx .ctx/context.ts
```

Then use it to prompt or save design documents:

```shell
./ctx prompt design/concepts/MyConcept.md
./ctx save design/concepts/MyConcept.md
```

**Important:** Do not modify the `context/` directory directly - it's an immutable history of all Context interactions.

## Deployment

The application is deployed on Render:
- **Backend**: Web Service (Docker)
- **Frontend**: Static Site


## License

This project was created as an assignment for MIT 6.1040 (Fall 2025).
