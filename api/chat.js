export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Kun POST er tilladt"
        });
    }

    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                error: "Du skal skrive et spørgsmål"
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-5-mini",
                    input: [
                        {
                            role: "system",
                            content:
                                "Du er en dansk arbejdshåndbog-assistent. Svar kort, præcist og på dansk. Hvis du ikke har oplysninger nok til at svare sikkert, skal du sige, at du ikke kan finde svaret i arbejdshåndbogen. Du må ikke opfinde telefonnumre, placeringer eller procedurer."
                        },
                        {
                            role: "user",
                            content: question
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "OpenAI API-fejl"
            });
        }

        const answer =
            data.output_text ||
            "Jeg kunne ikke finde et svar.";

        return res.status(200).json({
            answer: answer
        });

    } catch (error) {
        return res.status(500).json({
            error: "Der opstod en fejl på serveren."
        });
    }
}
