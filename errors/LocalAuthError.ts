class LocalAuthError extends Error {
	status: number;
	constructor(message: string,status?:number) {
		super(message);
		this.name = 'auth';
		if (status) {
			this.status = status;
		}
	}
}
export default LocalAuthError;