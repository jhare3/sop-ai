/your-project-root
/node_modules
/public
favicon.ico
index.html
/pdfs/ <-- All your SOP PDFs go here
backroom.pdf
cashier.pdf
fitting-room.pdf
etc...

    /scripts/
        pdfToJson.js <-- Node.js script that reads PDFs and generates sops.json (uses pfd2jason library)

    /src/
        App.css
        App.jsx <-- Your React app
        sops.json <-- Output file created from your PDFs (used by the app)
