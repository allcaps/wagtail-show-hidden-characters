PYTHON_VERSION ?= 3.13
PYTHON ?= .venv/bin/python
RUFF ?= .venv/bin/ruff
DJLINT ?= .venv/bin/djlint
NPM ?= npm

install:
	uv venv --python $(PYTHON_VERSION)
	uv pip install --python $(PYTHON) -e ".[test]"
	$(NPM) install

fix-codestyle:
	$(RUFF) check --exit-zero --fix src tests
	$(RUFF) format src tests
	$(DJLINT) tests/test_project --reformat --warn

test:
	$(PYTHON) tests/test_project/manage.py check
	$(PYTHON) tests/test_project/manage.py makemigrations --check --dry-run
	$(DJLINT) tests/test_project --lint --check
	$(RUFF) check src tests
	$(RUFF) format src tests --check
	$(NPM) test
	$(PYTHON) -X dev -m pytest $(ARGS)
