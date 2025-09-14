
## What this is
Companion notes for the banking processes demo. This document explains assumptions and outlines the project plan and timing.

## Annahmen
- Jedem Bankkonto wird genau eine Person zugeordnet
- Jede Person hat mindestens ein Bankkonto kann aber mehrere haben.
- Alle Geldbeträge sind in Euro bzw. in Euro Cents angegeben.
- Es wird nie mit Beträgen < 1 Cent gerechnet.
- Eine Person mit Kontostand < 0 EUR kann kein Geld verleihen.
- Eine Person kann nicht mehr als ihr Nettovermögen verleihen.
- Beim Leihen zählt nur die eine Differenz zu dem Freund mit dem höchsten Nettovermögen.
- Die tägliche Transaktionsliste enthalten nur Transkationen die zwischen bereits bekannten Benutzern/Accounts erfolgen.
- Security/Auth sind für diese Projekt nicht zu berücksichtigen.

## Plan
- [x] create yarn monorepo
	1. create root setup
	2. create project skeleton
	3. final time: 5 minutes
- [x] initialize db workspace
	1. setup env
	2. setup script that starts two docker instances with postgres and apache tinkerPop gremlin server
	3. final time: 30 minutes
- [x] initialize nestJs workspace
	- run generate command
	- cleanup
	- setup env
	- setup nestJs swagger integration
	- test minimal setup
	- final time: 1 hour 15 minutes
- [x] initialize nextJs workspace
	1. run t3-create-app command
	2. cleanup
	3. setup env
	4. integrate with nextJs swagger package with auto update mechanism
	5. create simple start page that uses the test endpoint
	6. final time: 45 minutes
- [x] Establish base configurations
	1. setup a base tsconfig
	2. setup base eslint config
	3. setup base prettier config
	4. final time: 1 hour 30 minutes
- [x] initialize shared workspace
	1. create simple typescript setup
	2. create sample function that generates a random number
	3. use it in the endpoint and in the nextJs application
	4. final time: 1 hour 30 minutes
- [x] integrate db workspace
	1. setup proper db:start command
	2. add sample typeORM schema for postgres
	3. setup typeORM migration commands
	4. setup access to postgres via typeORM
	5. setup access to graphDB via gremlin
	6. add seeding mechanism
	7. final time: 4 hours
- [x] create transaction generation mechanism
	1. create dynamic transaction generation script
	2. create simple interface to control it in nextJs
	3. final time: 15 minutes
- [x] implement backend
	1. create the described routes
	2. check for robust error handling on all endpoints
	3. add a bunch of swagger decorators and proper input validation
	4. additional endpoint hardening
	5. final time: 6 hour
- [x] create tests for the backend
	1. create basic test setup
	2. implement one unit test
	3. final time: 45 minutes
- [x] documentation
	1. create README document
	2. create META document that describes settings specific information
	3. add collected AI chats
	4. final time: 20 minutes
- [ ] implement frontend
	1. tbd
- [ ] deployment (optional)
	1. deploy postgres instance on coolify
	2. deploy apache tinkerPop gremlin server instance on coolify
	3. deploy nextJs workspace on coolify
	4. deploy nestJs workspace on coolify

Final Time: 16 hours 55 minutes (across three afternoons and 1 long Saturday)