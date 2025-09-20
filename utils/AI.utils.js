/**
 * Compare two JSON objects using Gemini API and return a classification
 * @param {object} json1 - First JSON object
 * @param {object} json2 - Second JSON object
 * @param {string} apiKey - Your Gemini API key
 * @returns {Promise<string>} - One of: 'not suspicious', 'suspicious', 'not checked'
 */
async function compareJsonObjects(json1, json2) {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const prompt = `
        You are a JSON comparison assistant. Your task is to compare the contents of two JSON objects, which may have different key names but represent the same data. The goal is to determine if the data is consistent or if there are discrepancies.

        JSON 1:
        ${JSON.stringify(json1, null, 2)}

        JSON 2:
        ${JSON.stringify(json2, null, 2)}

        Based on a comparison of the content and values, provide a single-word classification:
        - 'not suspicious' if the data is consistent and matches.
        - 'suspicious' if there are significant discrepancies or inconsistencies.
        - 'not checked' if the data is too sparse or unstructured to perform a reliable comparison.

        Strictly return only one of the three classifications as a string. Do not add any other text or commentary.
    `;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "text/plain" }
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        const classification = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();

        if (!['not suspicious', 'suspicious', 'not checked'].includes(classification)) {
            throw new Error("Unexpected response from API.");
        }

        return classification;

    } catch (err) {
        console.error('Error comparing JSON objects:', err);
        throw err;
    }
}

export {compareJsonObjects}