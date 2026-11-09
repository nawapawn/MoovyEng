---
name: loop-test-tdd-cycle
description: "Use test-driven development when implementing behavior with a runnable test framework."
---

# TDD Cycle

## Contract

Apply this skill only when the task matches: TDD Cycle. Keep the work within the requested scope and do not invent missing facts.

## When to Use

Use test-driven development when implementing behavior with a runnable test framework.

## Inputs

- The user goal, acceptance criteria, and constraints.
- The relevant repository files, existing conventions, commands, and test results.
- Any required tool capability, permission, or external dependency.

## Constraints

- Do not guess when a required input, contract, or project convention is unknown.
- Preserve existing behavior outside the requested scope and avoid unnecessary abstraction.
- Never hide failures by weakening validation, tests, or safety checks.
- If a shortcut creates technical debt, record its impact and the condition for revisiting it.

## Procedure

1. Confirm that the task matches this skill and identify the expected outcome.
2. Inspect the relevant files, dependencies, interfaces, and existing checks before changing anything.
3. Apply the guidance below using the smallest maintainable change.
4. Run the most relevant verification commands and inspect the final diff.
5. Report the result, evidence, unresolved risks, and any technical debt.

## Output

- Provide a concise summary of the change or decision.
- Include verification commands and their results.
- State assumptions, limitations, risks, and follow-up work when applicable.

## Verification

- Verify correctness, edge cases, compatibility, security, performance, and operational impact relevant to the task.
- If verification cannot be completed, explain why and do not claim success.

## Example

Input: A task that requires tdd cycle.
Expected: Apply the procedure and constraints, produce evidence, and respond to the user in natural Thai when the user communicates in Thai.

## Guidance

# TDD Cycle

## วงจรการพัฒนาพร้อมหลักฐานจริง (Verifiable TDD Cycle)

1. **Red**: เขียนหรือปรับ test ให้สะท้อน Acceptance Criteria (AC) ก่อนเสมอ รันคำสั่งจริงและยืนยันว่า test ล้มเหลวด้วยเหตุผลที่ถูกต้อง (ห้ามข้ามขั้นตอนหรือสมมติว่า fail เอง)
2. **Green**: เขียนโค้ด production ขั้นต่ำให้ test ผ่าน รันคำสั่งจริงเพื่อยืนยันผลการทดสอบผ่านด้วย terminal output
3. **Refactor**: ปรับปรุงโครงสร้างโค้ด รักษาความสะอาดและลด complexity โดยรัน test ซ้ำเพื่อให้มั่นใจว่าไม่มี regression

## กฎปฏิบัติป้องกัน Fake Done

- **ต้องมีผลการรันจริงยืนยัน**: ห้ามข้ามขั้นตอนการเขียนและรัน test เมื่อเพิ่ม behavior ใหม่
- **ห้ามติ๊กว่าผ่านโดยไม่มี log**: ทุกขั้นตอนของรอบ TDD ต้องมี execution log และ exit code ยืนยัน
- **ตรวจพฤติกรรมจริง (Behavior-focused)**: Test ต้องตรวจ behavior ที่ผู้ใช้หรือระบบต้องการ ไม่ผูกกับ implementation โดยไม่จำเป็น
- **ห้ามลดความเข้มงวดของ assertion**: ห้ามแก้ test ให้อ่อนลงเพื่อให้ผ่านหลอกๆ

## Design Quality

- เขียน test ให้สะท้อน behavior, contract และ invariant ที่มีคุณค่าต่อผู้ใช้ ไม่ล็อก implementation โดยไม่จำเป็น
- ใช้ failure ของ test เพื่อค้นหาปัญหาใน model หรือ design ไม่ใช่แค่แก้ assertion ให้ผ่าน
- ระหว่าง refactor ตรวจ complexity, coupling, state management และผลกระทบต่อ test อื่น
- ถ้า test ยากเกินไป ให้พิจารณา boundary และ dependency design ก่อนเพิ่ม mock จำนวนมาก
- บันทึก test gap และ technical debt แทนการแกล้งทำให้ coverage หรือ test result ดูดี
