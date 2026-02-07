export async function runLlmTests(domain: string) {
  return {
    ChatGPT: [
      `Summarizes ${domain} accurately but omits salary transparency details.`,
    ],
    Perplexity: [
      `References outdated benefits data for ${domain}.`,
    ],
  };
}
