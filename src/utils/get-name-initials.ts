const getNameInitials = (name: string) => {
  const nameParts = name.trim().split(' ')
  if (nameParts.length === 1) {
    return name.slice(0, 2).toUpperCase()
  } else {
    const firstInitial = nameParts[0].charAt(0).toUpperCase()
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    return firstInitial + lastInitial
  }
}

export { getNameInitials }
