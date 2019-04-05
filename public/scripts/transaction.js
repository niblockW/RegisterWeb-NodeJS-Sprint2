function startTrans(userID)
{
	let date = newDate();
	let timeStamp = date.getTime();
	let user = userID;
	let transactionID = user.concat('_', timeStamp);
	initialize(transactionID){
		let 
}