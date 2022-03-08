class InputError extends Error {
	status: number = 422;
	constructor(message: string,status?:number) {
		super(message);
		this.name = 'input';
		if (status) {
			this.status = status;
		}
	}
}
export default InputError;