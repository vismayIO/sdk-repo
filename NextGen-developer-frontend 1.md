
# **2-Week (10 Working Days) Evaluation Plan**

### **Frontend Developer – Micro-Frontend + Module Federation**

---

## 🧠 **Evaluation Focus Per Week**

| Week       | Focus                | Architecture Angle                     |
| ---------- | -------------------- | -------------------------------------- |
| **Week 1** | Micro-Frontend Core  | Can he build a federated app correctly |
| **Week 2** | Platform Integration | Can he behave like a platform engineer |

---

# **Week 1 – Micro-Frontend Foundations (5 Days)**

---

## **Day 1 – Micro-Frontend Basics & Host Integration**

### **What You Evaluate**

* Understanding of Micro-Frontend boundaries
* Module Federation basics
* Independent deployment mindset

### **Exercise**

1. Scaffold a **Micro-Frontend App** using Frontend CLI
2. Expose a page/module via Module Federation
3. Load it inside the **Host Application**

### **Thinking Questions**

* Why Module Federation over monorepo?
* What should NEVER be shared between MFEs?
* How do you version a micro-frontend safely?

---

## **Day 2 – React Structure Inside a Micro-Frontend**

### **What You Evaluate**

* Component isolation
* No cross-app leakage
* Clean boundaries

### **Exercise**

1. Build a **User Dashboard page**

   * Local routing
   * Reusable components
   * Local state only

### **Thinking Questions**

* Where should routing live: host or MFE?
* How do you avoid global CSS conflicts?
* How do you keep MFEs replaceable?

---

## **Day 3 – Backend API via Frontend SDK**

### **What You Evaluate**

* Correct SDK usage
* No direct API calls from UI
* Error handling

### **Exercise**

1. Fetch users using **Frontend SDK**
2. Create / Update user
3. Handle:

   * Loading
   * Error
   * Empty state

### **Thinking Questions**

* Why SDK is critical in MFE architecture?
* What happens if SDK version mismatches?
* Who owns backward compatibility?

---

## **Day 4 – Real-Time Events (NATS / Socket)**

### **What You Evaluate**

* Event-driven UI thinking
* Subscription lifecycle
* Cleanup & memory safety

### **Exercise**

1. Subscribe to `USER_CREATED` event
2. Update UI in real-time
3. Handle:

   * Reconnect
   * Duplicate events

### **Thinking Questions**

* Should socket live in host or MFE?
* How do you avoid event storms?
* REST vs events — where is the boundary?

---

## **Day 5 – UI Kit & Design System Compliance**

### **What You Evaluate**

* Discipline in using shared UI
* No custom CSS abuse
* Consistency

### **Exercise**

1. Replace all custom UI with **UI Kit components**
2. Follow spacing, typography, tokens
3. Ensure theme compatibility

### **Thinking Questions**

* Why UI kit is critical in MFEs?
* How to extend UI kit without breaking others?
* How to enforce usage across teams?

---

# **Week 2 – Platform Thinking & Ownership (5 Days)**

---

## **Day 6 – Shared State & Cross-MFE Communication**

### **What You Evaluate**

* Platform-level thinking
* Safe communication patterns

### **Exercise**

1. Consume shared data from host:

   * Logged-in user
   * Permissions
2. Emit event back to host

### **Thinking Questions**

* Why not share Redux store?
* How do MFEs communicate safely?
* What causes tight coupling?

---

## **Day 7 – Frontend CLI & Developer Experience**

### **What You Evaluate**

* Tooling mindset
* Automation discipline

### **Exercise**

1. Use CLI to:

   * Generate new page
   * Add route
   * Configure federation exposure

### **Thinking Questions**

* Why CLI is critical at scale?
* Risks of manual setup?
* How would you improve the CLI?

---

## **Day 8 – Performance & Isolation**

### **What You Evaluate**

* Performance awareness
* Bundle size discipline

### **Exercise**

1. Optimize MFE:

   * Lazy load heavy components
   * Avoid unnecessary shared deps
   * Measure bundle size

### **Thinking Questions**

* What should be shared vs isolated?
* How MFEs impact initial load?
* How to debug performance in MFEs?

---

## **Day 9 – Mini Project (Platform-Ready MFE)**

### **Mini Project**

**“User Management Micro-Frontend”**

### **Must Include**

* Loaded via Module Federation
* Uses Frontend SDK
* Uses UI Kit
* Real-time updates
* CLI-generated structure

### **Evaluation Focus**

* Architecture correctness
* Clean boundaries
* Production-grade decisions

---

## **Day 10 – Final Review & Architecture Defense**

### **Candidate Must Explain**

* Why this MFE design?
* What can break in production?
* How to scale to 20+ MFEs?

### **Mentor Evaluation**

* Code walkthrough
* Architecture Q&A
* Ownership mindset

---

# 🧩 **Evaluation Rubric (Aligned to Platform)**

| Area                        | What You Judge                   |
| --------------------------- | -------------------------------- |
| **React Skills**            | Hooks, structure, patterns       |
| **Micro-Frontend Thinking** | Isolation, federation, ownership |
| **Integration Skills**      | SDK, socket, host communication  |
| **Design Discipline**       | UI kit & consistency             |
| **Platform Mindset**        | Scalability, DX, trade-offs      |

---