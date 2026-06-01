export function parseFormDataToProfile(formData) {
    const result = {};

    const allEntries = [];
    for (const [key, value] of Object.entries(formData)) {
        if (Array.isArray(value)) {
            value.forEach(v => allEntries.push([key, v]));
        } else {
            allEntries.push([key, value]);
        }
    }

    for (const [flatKey, value] of allEntries) {
        const parts = flatKey.split("-");
        let current = result;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            const nextPart = parts[i + 1];
            const nextIsIndex = !isNaN(Number(nextPart));

            if (Array.isArray(current)) {
                const index = Number(part);
                if (current[index] === undefined) {
                    current[index] = nextIsIndex ? [] : {};
                }
                current = current[index];
                continue;
            }

            if (current[part] === undefined) {
                current[part] = nextIsIndex ? [] : {};
            }

            current = current[part];
        }

        const lastKey = parts[parts.length - 1];

        if (Array.isArray(current)) {
            current[Number(lastKey)] = value;
        } else {
            if (current[lastKey] !== undefined) {
                if (!Array.isArray(current[lastKey])) {
                    current[lastKey] = [current[lastKey]];
                }
                current[lastKey].push(value);
            } else {
                current[lastKey] = value;
            }
        }
    }

    return result;
}