# Banking System Architecture

## Architecture Evolution

### V1 — Monolithic Architecture

Commit: `v1.0.0`

The entire banking application runs as a single Node.js application.

```text
Client
   |
   v
Express API
   |
   +---- Auth
   |
   +---- Users
   |
   +---- Accounts
   |
   +---- Transactions
   |
   +---- Database

V2:
                        +----------------+
    Client -----------> |  API Gateway   |
                        +-------+--------+
                                |
                +--------------+--------------+
                |              |              |
                v              v              v
            Auth Service   Account Service  Transaction
                |              |              |
                v              v              v
            Auth DB        Account DB     Transaction DB