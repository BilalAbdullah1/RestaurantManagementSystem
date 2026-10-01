const fs = require('fs');
const readline = require('readline');

async function fixWarnings() {
    const logPath = 'C:\\Users\\bilal\\OneDrive\\Desktop\\SMS\\warnings_utf8.txt';
    const fileStream = fs.createReadStream(logPath);
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const fileFixes = {}; // filePath -> array of fixes { line, code }

    for await (const line of rl) {
        // Example: C:\Users\bilal\OneDrive\Desktop\SMS\SMS.Domain\Common\AttendanceRecordDto.cs(18,42): warning CS8618: ...
        const match = line.match(/^(C:[^(]+)\((\d+),(\d+)\):\s*warning\s+(CS\d+):/);
        if (match) {
            const filePath = match[1];
            const lineNum = parseInt(match[2], 10) - 1; // 0-indexed
            const code = match[4];
            
            if (!fileFixes[filePath]) {
                fileFixes[filePath] = [];
            }
            fileFixes[filePath].push({ line: lineNum, code });
        }
    }

    let fixedFilesCount = 0;

    for (const filePath of Object.keys(fileFixes)) {
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');
        let lines = content.split(/\r?\n/);
        let modified = false;

        const fixes = fileFixes[filePath];
        // Sort descending to not mess up line numbers
        fixes.sort((a, b) => b.line - a.line);

        for (const fix of fixes) {
            const l = fix.line;
            if (l >= lines.length) continue;

            let lineStr = lines[l];
            
            if (fix.code === 'CS8618') {
                if (!lineStr.includes('default!')) {
                    const lastBraceIndex = lineStr.lastIndexOf('}');
                    if (lastBraceIndex !== -1) {
                        lines[l] = lineStr.substring(0, lastBraceIndex + 1) + ' = default!;' + lineStr.substring(lastBraceIndex + 1);
                        modified = true;
                    }
                }
            } else if (fix.code === 'CS8603' || fix.code === 'CS8601' || fix.code === 'CS8604') {
                if (!lineStr.includes('!;')) {
                    const lastSemiIndex = lineStr.lastIndexOf(';');
                    if (lastSemiIndex !== -1) {
                        lines[l] = lineStr.substring(0, lastSemiIndex) + '!' + lineStr.substring(lastSemiIndex);
                        modified = true;
                    } else if (lineStr.includes('=>')) {
                         lines[l] = lineStr + '!;';
                         modified = true;
                    }
                }
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            fixedFilesCount++;
        }
    }

    console.log(`Fixed warnings in ${fixedFilesCount} files.`);
}

fixWarnings().catch(console.error);
