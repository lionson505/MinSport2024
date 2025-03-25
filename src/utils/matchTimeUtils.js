export const calculateMatchMinute = (startTime, updatedAt, firstTime, firstAddedTime, secondTime = 0, secondAddedTime = 0) => {
  const now = new Date();
  const start = new Date(startTime);
  const update = new Date(updatedAt);

  let diffInMinutes;

  if (now - start < (firstTime + firstAddedTime) * 60 * 1000) {
    // Use startTime for the first half
    diffInMinutes = Math.floor((now - start) / (1000 * 60));
  } else {
    // Use updatedAt for the second half
    diffInMinutes = Math.floor((now - update) / (1000 * 60)) + firstTime + firstAddedTime;
  }

  const totalFirstHalf = firstTime + firstAddedTime;
  const totalSecondHalf = secondTime + secondAddedTime;
  const totalAllowedMinutes = totalFirstHalf + totalSecondHalf;

  if (diffInMinutes <= totalFirstHalf) {
    return Math.max(0, diffInMinutes).toString();
  } else if (diffInMinutes <= totalFirstHalf + secondTime) {
    return (diffInMinutes).toString();
  } else if (diffInMinutes <= totalAllowedMinutes) {
    return (diffInMinutes).toString();
  } else {
    return totalAllowedMinutes.toString();
  }
}; 