# Evidence Uploader API

A Python FastAPI app.

## Setup

Some software is required to run the app. These instructions have been tested on Ubuntu 20.04, but should translate well to OSX.

### Install/update `poetry`

#### Ubuntu:

Install Python 3.9 or later:

```
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.9-dev
```

Install Pip and Poetry:

```
sudo apt update
sudo apt install python3-pip
pip3 install poetry
```

#### OSX (untested)

There will be a dependency on Postgres for poetry install. Please install Postgres first.
Reference is at [github](https://github.com/psycopg/psycopg2/issues/1200#issuecomment-776159466)

```
brew install poetry pyenv
pyenv install 3.9.10
pyenv local 3.9.10
brew install postgresql
```

### Install python packages

```
poetry install
```

### Run the app

First you'll need to create a database (make sure Postgres is installed). Make sure to set the appropriate variables in `src/.env` as well. You can copy `.env.dist` as a reference

```
createdb -U <dbuser> <dbname>
```

Then, initialize:

```
cd backend
poetry run python src/pre_start.py
```

Now you can run the server with live reload:

```
nx serve api-evidence
```

### Test

Run the tests

```
nx test api-evidence
```

### Format

Run black formatter

```
nx run api-evidence:format
```

### Migrations

TODO -- add executors

Apply migrations

```
poetry run alembic upgrade head
```

Generate a migration

```
poetry run alembic revision --autogenerate -m "Description"
```

## App configuration table

| Key                    | Default          | Description                                |
| ---------------------- | ---------------- | ------------------------------------------ |
| MAX_FILE_TTL           | 90               | Maximum lifetime of evidence files in days |
| S3_BUCKET              | evidence-uploads | S3 bucket for App files                    |
| S3_ENDPOINT            |                  | S3 endpoint                                |
| S3_KEY                 |                  | S3 client key                              |
| S3_SECRET              |                  | S3 client secret                           |
| S3_REGION              |                  | S3 region                                  |
| SHORTENER_URL          |                  | Private URL shortener for project links    |
| SHORTENER_ACCESS_TOKEN |                  | Access token for URL shortener             |
