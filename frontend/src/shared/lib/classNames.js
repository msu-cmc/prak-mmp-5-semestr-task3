export function classNames(
    cls,
    mods,
    additional,
) {
    return [
        cls,
        ...additional.filter(Boolean),
        ...Object.entries(mods)
            .filter(([cls, value]) => Boolean(value))
            .map(([className]) => className),
    ]
        .join(" ");
}
