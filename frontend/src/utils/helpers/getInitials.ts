export const getInitials = (name: string = "") => {
  if (!name) return "U";
  const nameParts = name.split(" ");
  if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  } else if (
    nameParts.length === 1 &&
    nameParts[0] &&
    nameParts[0].length > 0
  ) {
    return `${nameParts[0][0]}`.toUpperCase();
  }
  return "U";
};
