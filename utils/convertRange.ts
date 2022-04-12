/**
 * Convert value from one range to another
 * @param {Number} value value to convert
 * @param {Object} oldRange min, max of values range
 * @param {Object} newRange min, max of desired range
 * @return {Number} value converted to other range
 */
export default function convertRange(
	value: number,
	oldRange: { min: number; max: number },
	newRange: { min: number; max: number }
): number {
	return Math.round(
		((value - oldRange.min) * (newRange.max - newRange.min)) /
			(oldRange.max - oldRange.min) +
			newRange.min
	);
}
