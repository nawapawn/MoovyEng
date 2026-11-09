---
name: core-no-assumptions
description: "Resolve missing facts, ambiguous requirements, or uncertain repository contracts before implementation."
---

# No Assumptions

## Contract

Apply this skill only when the task matches: No Assumptions. Keep the work within the requested scope and do not invent missing facts.

## When to Use

Resolve missing facts, ambiguous requirements, or uncertain repository contracts before implementation.

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

Input: A task that requires no assumptions.
Expected: Apply the procedure and constraints, produce evidence, and respond to the user in natural Thai when the user communicates in Thai.

## Guidance

# No Assumptions

## เป้าหมาย

ลดการเดา ป้องกันการ over-engineer และป้องกันพฤติกรรม "จินตนาการเกินโจทย์" (Prompt บาป) ที่ทำให้ผลลัพธ์หลุดขอบเขตหรือไม่สอดคล้องกับระบบเดิม

## กฎปฏิบัติป้องกัน Agent จินตนาการเกินโจทย์

- **ห้ามเดาขอบเขต (Anti-Scope Creep)**: เมื่อได้รับโจทย์สั้นหรือมีรายละเอียดกำกวม ห้ามคิดฟีเจอร์เพิ่ม ห้ามเติม UX/UI หรือ API endpoints เองโดยไม่ได้รับอนุมัติ
- **Spec Template มาตรฐานก่อนเริ่มงาน**: สำหรับงานที่ซับซ้อนหรือกระทบหลายจุด ให้สกัด Spec สรุปสาระสำคัญก่อนลงมือแก้ไข:
  1. **Goal & Scope Boundary**: ระบุสิ่งที่ทำ (In-Scope) และสิ่งที่เจาะจงว่า *ไม่ทำ* (Out-of-Scope / Non-goals) ให้ชัดเจน
  2. **Inputs / Outputs & Contracts**: ระบุรูปแบบข้อมูล, schema, API signatures และ UI states ที่เกี่ยวข้อง
  3. **Acceptance Criteria (AC)**: เขียนเกณฑ์การตรวจรับแบบชัดเจน (Given-When-Then หรือ Checklist ที่ตรวจวัดผลได้จริง 100%)
  4. **Constraints & Invariants**: กฎข้อห้ามและเงื่อนไขความเข้ากันได้ย้อนหลัง (Backward Compatibility)
- **Protocol เมื่อข้อมูลไม่ครบ (`[NEED_INFORMATION]`)**: หากขาดข้อมูลสำคัญที่จำเป็นต่อการตัดสินใจ ให้ระบุชัดเจนว่าต้องการข้อมูลอะไรและถามผู้ใช้ตรงประเด็นทันที ห้ามอนุมาน (infer) ต่อเติมเองไปเรื่อยๆ
- **รักษา Consistency ตาม Practice เดิม**: ตรวจสอบรูปแบบและโครงสร้างที่โปรเจกต์เคยทำสำเร็จมาก่อน แล้วปฏิบัติตาม conventions เดิมอย่างเคร่งครัด
- **ขอการยืนยันก่อนแตะหลายส่วน**: ก่อนแก้ไขที่กระทบหลายไฟล์หรือหลายชั้นของระบบ ให้สรุปขอบเขตไฟล์ที่จะเปลี่ยนและเหตุผล แล้วขอการยืนยันจากผู้ใช้
- **ห้ามแก้ไฟล์นอกขอบเขต**: ห้ามแตะไฟล์นอกเหนือจากที่ผู้ใช้ระบุ เว้นแต่เป็นไฟล์ config หรือ test ที่จำเป็นต่อการ build/verify โดยต้องอธิบายให้ทราบก่อน

## Engineering Reasoning

- ก่อนแก้ ให้ระบุ problem, constraints, assumptions, invariants และส่วนที่อาจได้รับผลกระทบ
- คิดถึง failure modes, concurrency, data loss, security, performance และ backward compatibility ที่อาจเกิดในอนาคต
- เปรียบเทียบทางเลือกอย่างน้อยแบบที่แก้ง่าย/เร็วกับแบบที่ยั่งยืน แล้วเลือกตาม risk และขนาดงาน ไม่ over-engineer
- ถ้าจำเป็นต้องใช้ shortcut ให้บันทึก technical debt: เหตุผล, ผลกระทบ, trigger ที่ต้องกลับมาแก้ และแนวทางแก้ถาวร
- ใช้หลัก YAGNI แต่ห้ามแลกความถูกต้อง ความปลอดภัย หรือ invariant สำคัญกับความเร็วระยะสั้น
