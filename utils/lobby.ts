export function generateLobbyCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

export function generateLobbyLink(code: string): string {
  return `climax://lobby/${code}`;
}

export function extractCodeFromLink(link: string): string | null {
  const match = link.match(/climax:\/\/lobby\/([A-Z0-9]{6})/);
  return match ? match[1] : null;
}
