const errorHandler = (err, req, res, next) => {
  console.log(err.stack);

  const statusCode = err.statusCode || 500;
  console.log(err)
  const errorMessage = err.message || "INTERNAL SERVER ERROR";
  res.status(statusCode).json({error: errorMessage });
  
}

module.exports = {
  errorHandler
}
