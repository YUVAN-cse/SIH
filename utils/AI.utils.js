async function compareData(data1, data2) {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const isJson1 = typeof data1 === "object" && data1 !== null;
    const isJson2 = typeof data2 === "object" && data2 !== null;

    const formatData = (d) => (typeof d === "object" && d !== null ? JSON.stringify(d, null, 2) : d);

    const prompt = `
        You are a data comparison assistant. Compare the following two inputs and determine if they are consistent.

        Data 1:
        ${formatData(data1)}

        Data 2:
        ${formatData(data2)}

        Provide a single-word classification:
        - 'not suspicious' if the data is consistent and matches.
        - 'suspicious' if there are significant discrepancies or inconsistencies.
        - 'not checked' if the data is too sparse or unstructured to reliably compare.

        Strictly return only one of the three classifications as a string. No additional commentary.
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
        console.error('Error comparing data:', err);
        throw err;
    }
}

export { compareData };
