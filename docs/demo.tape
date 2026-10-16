# Records demo.gif: run the app with an in-memory SQLite database.
# Regenerate it with: vhs demo.tape

Output docs/demo.gif

Set Shell "bash"
Set FontSize 16
Set Width 1200
Set Height 700
Set Padding 20
Set TypingSpeed 40ms

# Build quietly, so the GIF starts at the interesting part
Hide
Type "export PS1='$ '"
Enter
Type "npm run build > /dev/null 2>&1; echo BUILD-$((1+1))"
Enter
Wait+Screen@120s /BUILD-2/
Type "clear"
Enter
Show

Type "# Start the app with a database that lives only in memory"
Enter
Type "LGTTM_DATABASE_PATH=:memory: node dist/main &"
Enter
Sleep 3s

Type "# Create a list, then read all lists back"
Enter
Type `curl -s -w '\n' -X POST localhost:3000/api/lists -H 'Content-Type: application/json' -d '{"title": "Leroy Merlin"}'`
Enter
Sleep 3s

Type `curl -s -w '\n' localhost:3000/api/lists`
Enter
Sleep 3s

Type "# Stop the app: the data is gone with it"
Enter
Type "kill %1"
Enter
Sleep 3s
