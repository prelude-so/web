import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Prelude from "@prelude.so/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express, { Request, Response } from 'express';
import path from 'path';
import createError, { HttpError } from 'http-errors';
import logger from 'morgan';

var app = express();
express.static.mime.define({'application/wasm': ['wasm']});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const prelude = new Prelude({
  apiToken: process.env.DEMO_API_KEY,
});

app.get('/', function(req: Request, res: Response, next: express.NextFunction) {
  res.render('signin', { title: 'Prelude SDK Demo Server', sdkKey: process.env.DEMO_SDK_KEY });
});

app.post('/signin', async function(req: Request, res: Response, next: express.NextFunction) {
  console.log('Creating verification for phone number: ' + req.body.dispatchId);
  const verification = await prelude.verification.create({
    target: {
      type: "phone_number",
      value: req.body.phoneNumber,
    },
    dispatch_id: req.body.dispatchId,
  });

  console.log('Verification ID: ' + verification.id);

  res.redirect('/verify?phoneNumber=' + encodeURIComponent(req.body.phoneNumber));
});

app.get('/verify', async function(req: Request, res: Response, next: express.NextFunction) {
  res.render('verify', { title: 'Prelude SDK Demo Server', phoneNumber: req.query.phoneNumber, error: req.query.error });
});

app.get('/verifysuccess', async function(req: Request, res: Response, next: express.NextFunction) {
  res.render('verifysuccess', { title: 'Prelude SDK Demo Server', phoneNumber: req.query.phoneNumber });
});

app.post('/verify', async function(req: Request, res: Response, next: express.NextFunction) {
  try {
    const check = await prelude.verification.check({
      target: {
        type: "phone_number",
        value: req.body.phoneNumber,
      },
      code: req.body.code,
    });

    if (check.status == "success") {
      res.redirect('/verifysuccess?phoneNumber=' + encodeURIComponent(req.body.phoneNumber));
    } else {
      res.redirect('/verify?phoneNumber=' + encodeURIComponent(req.body.phoneNumber) + '&error=' + encodeURIComponent(check.status));
      console.log('Check ID: ' + check.status);
    }
  } catch (e: any) {
    console.log(e);
    res.redirect('/verify?phoneNumber=' + encodeURIComponent(req.body.phoneNumber) + '&error=' + encodeURIComponent(e));
  }
});

// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: express.NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: HttpError, req: Request, res: Response, next: express.NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// start the server
const port = process.env.BACK_PORT || 3001;
const sdkKey = process.env.DEMO_SDK_KEY;
const apiKey = process.env.DEMO_API_KEY;
app.listen(port, () => {
  if (sdkKey == undefined || apiKey == undefined) {
    console.log(`Please set the DEMO_SDK_KEY and DEMO_API_KEY environment variables to your Prelude App values. They are required to make requests to report the Signals.\nFind them in your dashboard screen.\n\nServer not started.`);
    process.exit(1);
  } else {
    console.log(
      `Demo server running: http://localhost:${port}`
    );
    console.log(
      `Using SDK key: ${sdkKey} and API key: ${apiKey}`
    );
  }
});
