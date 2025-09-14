export function calculateLoan(
    myBalance: number,
    maxFriendBalance: number | undefined,
) {
    if (maxFriendBalance === undefined) return 0;
    if (maxFriendBalance === 0) return 0;
    if (myBalance >= maxFriendBalance) return 0;

    const delta = maxFriendBalance - myBalance;
    return Math.min(maxFriendBalance, delta);
}
