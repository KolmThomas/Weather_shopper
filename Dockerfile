# Verwende ein Debian-basiertes Node-Image als Basis
FROM node

# Setze das Arbeitsverzeichnis innerhalb des Containers
WORKDIR /usr/src/app

# Kopiere die Projektdateien in das Arbeitsverzeichnis
COPY . .

# Kopiere die .env-Datei
#COPY .env .

# Installiere die Abhängigkeiten
RUN npm install

# Führe den Befehl aus, um Playwright-Browser zu installieren
RUN npx playwright install

# Installiere Playwright-Abhängigkeiten
RUN npx playwright install-deps

# Baue das TypeScript-Projekt
RUN npm run build

# Führe die Playwright-Tests aus
CMD ["npm", "test"]