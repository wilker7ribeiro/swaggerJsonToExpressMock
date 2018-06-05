import express = require('express');
import morgan = require("morgan")

import { ErrorRequestHandler } from "express";
import { RequestHandler } from "express-serve-static-core";
import { ModuleManager } from './lib/ServiceManager';


const app: express.Express = express();

const errorHandlerMiddleware: ErrorRequestHandler= (err, req, res, next) => {
    if (!err) return next();

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    res.status(err.status || 500);
    res.json('error');
}

const notFoundMiddleware: RequestHandler = (req, res, next) => {
    res.status(404);
    res.send('404 Not Found');
}

app.use(errorHandlerMiddleware)
app.use(morgan('dev'));

ModuleManager.init(app, ()=>{

    app.use(notFoundMiddleware);
    app.listen(3000);
});

