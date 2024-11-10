export const levenshteinDistance = (text1, text2) => {
    // Validar que text1 y text2 no sean null, undefined o vacíos
    if (!text1 || !text2) {
        console.error("Uno o ambos textos son inválidos", { text1, text2 });
        return null; // Puedes devolver un valor especial o manejarlo como creas conveniente
    }

    const track = Array(text2.length + 1).fill(null).map(() =>
        Array(text1.length + 1).fill(null)
    );

    // Rellenar la primera fila
    for (let i = 0; i <= text1.length; i += 1) {
        track[0][i] = i;
    }

    // Rellenar la primera columna
    for (let j = 0; j <= text2.length; j += 1) {
        track[j][0] = j;
    }

    // Calcular distancias
    for (let j = 1; j <= text2.length; j += 1) {
        for (let i = 1; i <= text1.length; i += 1) {
            const indicator = text1[i - 1] === text2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,       // Inserción
                track[j - 1][i] + 1,       // Eliminación
                track[j - 1][i - 1] + indicator // Sustitución
            );
        }
    }

    return track[text2.length][text1.length];
};
