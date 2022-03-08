class NotFoundError extends Error {
	status: number = 404;
	constructor(message: string,status?:number) {
		super(message);
		this.name = 'notFound';
		if (status) {
			this.status = status;
		}
	}
}
export default NotFoundError;