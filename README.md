# **ScalePay: Decentralized Attendance and Payroll**

## **Introduction**

**ScalePay** is a decentralized application (dApp) built on the **BNB Chain** to streamline attendance tracking, leave management, and payroll processing. It ensures transparency and fairness by leveraging blockchain technology, providing a secure and decentralized solution for managing workforce operations.

This project is developed exclusively for submission to the **`BNB Hack 2024 Q4: The Ultimate Battle of Hacker Heroes`** hackathon, hosted on DoraHacks.

---

## **Problem Statement**

Traditional employee attendance and payroll systems are prone to inefficiencies and inaccuracies due to their centralized nature. Employers often struggle with:

- Tracking attendance accurately without manual intervention.
- Managing leave requests and payouts transparently.
- Ensuring timely salary distribution.  
  On the other hand, employees lack a clear view of their attendance, fines, bonuses, and salary details, which can lead to mistrust and dissatisfaction.

---

## **Proposed Solution**

**ScalePay** solves these challenges by:

1. **Decentralizing Workforce Management**: Attendance, leave records, and payroll data are stored on the **BNB Chain**, ensuring immutability and transparency.
2. **Automating Processes**: Smart contracts handle attendance tracking, leave approvals, salary calculations, and payouts.
3. **Improving Visibility**: Both employers and employees can interact with the system in real-time via a user-friendly Next.js-based frontend.

---

## **Features**

### **Employer Functionalities**

- **Attendance Management**:
  - View and manage attendance records.
  - Automatically mark absent if employees fail to log out.
- **Leave Management**:
  - Approve or reject leave applications.
- **Employee Management**:
  - Add or remove employees by linking their wallet addresses.
- **Payroll Management**:
  - Apply bonuses or fines to employees.
  - Process salary payouts either manually or automatically.
- **Office Configuration**:
  - Set office rules such as working hours, buffer time, paid leave limits, and payout schedules.

### **Employee Functionalities**

- **Attendance Tracking**:
  - Log in and log out to mark attendance.
- **Leave Requests**:
  - Submit leave applications.
- **Payroll Information**:
  - View salary details, including bonuses, fines, and leaves.

---

## **Technology Stack**

### **1. Blockchain**

- **BNB Chain**: Decentralized and immutable ledger for attendance and payroll data.

### **2. Smart Contracts**

- **Language**: Solidity
- Deployment and testing via **Remix**.

### **3. Frontend**

- **Framework**: Next.js
- **Wallet Integration**: ThirdWeb

---

## **Setup Guide**

### **1. Smart Contract Deployment**

#### **Prerequisites**

- Install **Remix** or access it via the web at [Remix IDE](https://remix.ethereum.org).
- Have a wallet (e.g., MetaMask) with test BNB for deploying the contract on the **BNB Chain Testnet**.

#### **Steps**

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/pratham1015/ScalePay.git
   cd ScalePay
   ```

2. **Compile the Smart Contract**:

   - Navigate to the `contracts` folder.
   - Open the contract in Remix IDE and compile it.

3. **Deploy the Contract**:
   - Select the **Injected Provider (MetaMask)** in Remix.
   - Deploy the contract on the **BNB Chain Testnet**.
   - Note the **contract address** after deployment.

---

### **2. Frontend Setup**

#### **Steps**

1. **Install Dependencies**:

   ```bash
   cd frontend
   bun install
   ```

2. **Update the Contract Address**:

   - Open the file `frontend/contracts/contracts.ts`.
   - Replace the `ScalePayFactoryContractAddress` with the deployed contract address:
     ```ts
     export const ScalePayFactoryContractAddress =
       "<deployed-contract-address>";
     ```

3. **Build and Run the Frontend**:

   ```bash
   bun dev
   ```

4. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.

---

## **How to Use**

### **For Employers**

1. **Set Office Rules**: Configure working hours, buffer time, and paid leave limits from the dashboard.
2. **Manage Attendance**: View attendance records and flagged entries for anomalies.
3. **Review Leaves**: Approve or reject employee leave applications.
4. **Process Payroll**: Apply bonuses or fines, and process payouts.

### **For Employees**

1. **Log Attendance**: Use the dashboard to log in and log out daily.
2. **Apply for Leave**: Submit leave requests via the leave management section.
3. **View Payroll Details**: Track salary details, including bonuses, fines, and attendance adjustments.

---

## **Steps for Testing**

1. **Run Unit Tests**:  
   Navigate to the `contracts` directory and run:

   ```bash
   forge test
   ```

2. **Check Frontend Integration**:
   - Run the frontend application.
   - Connect MetaMask to the **BNB Testnet**.
   - Interact with the deployed contract via the frontend to test functionalities.

---

## **Acknowledgment**

This project was developed exclusively for the **`BNB Hack 2024 Q4: The Ultimate Battle of Hacker Heroes`** hackathon, hosted on DoraHacks.

---

## **Contributing**

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push your branch and open a pull request.

---
