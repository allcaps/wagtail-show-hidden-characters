fix-codestyle:
	ruff check --exit-zero --fix src tests
	ruff format src tests
	djlint tests/test_project --reformat --warn

test:
	djlint tests/test_project --lint --check
	ruff check src tests
	ruff format src tests --check
	python -X dev -m pytest $(ARGS)
