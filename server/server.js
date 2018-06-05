var express = require("express");
var morgan = require("morgan")
var glob = require("glob")
var path = require("path");
var app = express();

const errorHandlerMiddleware = (err, req, res, next) => {
    if (!err) return next();

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    res.status(err.status || 500);
    res.json('error');
}

const notFoundMiddleware = (req, res, next) => {
    res.status(404);
    res.send('404 Not Found');
}

app.use(errorHandlerMiddleware)
app.use(morgan('dev'));

glob("server/api/*.js", (err, fileList) => {
    console.log(fileList)
    fileList.forEach(filePath => require(path.join(process.cwd(), filePath))(app))


    app.use(notFoundMiddleware);
    app.listen(3000);
})



