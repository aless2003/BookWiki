# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` *before* implementation
3. **Test-Driven Development:** Write unit tests before implementing functionality
4. **No Minimum Test Coverage:** While TDD is encouraged, there is no strict minimum coverage requirement (0%).
5. **User Experience First:** Every decision should prioritize user experience
6. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for watch-mode tools (tests, linters) to ensure single execution.

## Task Workflow

All tasks follow a strict lifecycle:

### Standard Task Workflow

1. **Select Task:** Choose the next available task from `plan.md` in sequential order

2. **Mark In Progress:** Before beginning work, edit `plan.md` and change the task from `[ ]` to `[~]`

3. **Write Tests (Recommended Phase):**
   - Create a new test file for the feature or bug fix.
   - Write tests that define the expected behavior.
   - Run the tests.

4. **Implement Feature:**
   - Write the application code to implement the task.
   - Run the test suite and confirm functionality.

5. **Refactor (Optional but Recommended):**
   - Refactor the implementation code and the test code to improve clarity and performance.

6. **Document Deviations:** If implementation differs from tech stack:
   - **STOP** implementation
   - Update `tech-stack.md` with new design
   - Add dated note explaining the change
   - Resume implementation

7. **Record Task Progress:**
   - Read `plan.md`, find the line for the completed task, and update its status from `[~]` to `[x]`.
   - Work continues to the next task until the phase is complete.

### Phase Completion Verification and Checkpointing Protocol

**Trigger:** This protocol is executed immediately after all tasks in a **Phase** are completed.

1.  **Announce Protocol Start:** Inform the user that the phase is complete and the verification and checkpointing protocol has begun.

2.  **Verify Functionality:**
    -   Ensure all features in the phase work as intended.
    -   Run existing tests to ensure no regressions.

3.  **Execute Automated Tests:**
    -   Announce the shell command: "I will now run the automated test suite to verify the phase."
    -   Execute the command.
    -   If tests fail, begin debugging (max 2 attempts).

4.  **Propose Manual Verification Plan:**
    -   Generate a step-by-step plan for the user to verify the phase's goals.
    -   Await explicit user confirmation ("yes").

5.  **Commit Phase Changes:**
    -   Stage all code changes and plan updates for the completed phase.
    -   Propose a clear commit message e.g, `feat(worldbuilding): Complete Phase 1 - Basic Item System`.
    -   Perform the commit.

6.  **Attach Phase Summary with Git Notes:**
    -   **Step 6.1: Get Commit Hash:** Obtain the hash of the phase completion commit.
    -   **Step 6.2: Draft Note Content:** Create a detailed summary of the phase, including changes, files, and verification results.
    -   **Step 6.3: Attach Note:** Use `git notes add -m "<note content>" <commit_hash>`.

7.  **Record Phase Checkpoint SHA:**
    -   **Step 7.1: Get Commit Hash:** Obtain the 7-character hash.
    -   **Step 7.2: Update Plan:** Append `[checkpoint: <sha>]` to the phase heading in `plan.md`.

8. **Commit Plan Update:**
    - Stage and commit the updated `plan.md` with `conductor(plan): Mark phase '<PHASE NAME>' as complete`.

9.  **Announce Completion:** Inform the user that the phase and its checkpoint are finalized.

## Quality Gates

Before marking any phase complete, verify:

- [ ] All tests pass
- [ ] Code follows project's code style guidelines
- [ ] All public functions/methods are documented
- [ ] Type safety is enforced
- [ ] No linting or static analysis errors
- [ ] Works correctly on mobile (if applicable)
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced

## Development Commands

### Backend (Spring Boot)
```bash
# Install dependencies & build
./gradlew build -x test

# Run tests
./gradlew test

# Start application
./gradlew bootRun
```

### Frontend (React/Bun)
```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun test

# Lint
bun run lint
```

## Commit Guidelines

### Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintenance tasks

## Definition of Done

A phase is complete when:

1. All code implemented to specification
2. All tasks in the phase marked `[x]` in `plan.md`
3. Code passes all configured checks
4. Manual verification successful
5. Changes committed as a phase checkpoint
6. Git note with phase summary attached to the commit
