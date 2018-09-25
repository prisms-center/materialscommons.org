import sys
import time
import logging
import argparse

from ..common.TestProject import TestProject
from ..utils.LoggingHelper import LoggingHelper
from ..globus.GlobusMCUploadPrepare import GlobusMCUploadPrepare


def main(project, user_id, globus_endpoint, globus_base_path, excel_file_path, data_dir_path):
    from ..globus_etl_upload.etl_task_library import startup_and_verify
    main_log = logging.getLogger("top_level_run_ELT_example")

    experiment_name = "Test from excel"
    experiment_description = "An experiment built via etl from test data"

    main_log.info("user_id = {}".format(user_id))
    main_log.info("project = '{}' ({})".format(project.name, project.id))
    main_log.info("experiment_name = {}".format(experiment_name))
    main_log.info("experiment_description = {}".format(experiment_description))
    main_log.info("globus_endpoint = {}".format(globus_endpoint))
    main_log.info("base_path = {}".format(globus_base_path))
    main_log.info("excel_file_path = {}".format(excel_file_path))
    main_log.info("data_dir_path = {}".format(data_dir_path))

    main_log = logging.getLogger("main")
    handler = GlobusMCUploadPrepare(user_id)
    main_log.info("Starting setup")
    status_record_id = handler.setup_etl(project.id, experiment_name, experiment_description,
                                         globus_endpoint, globus_base_path,
                                         excel_file_path, data_dir_path)
    main_log.info("Starting verify")
    verify_status = handler.verify(status_record_id)
    main_log.info("Verify status = {}".format(verify_status))


if __name__ == "__main__":
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")

    argv = sys.argv
    parser = argparse.ArgumentParser(
        description='Run the Globus/ETL process with test data - in a predefined test endpoint')
    parser.add_argument('--user', type=str, help="Materials Commons user id")
    parser.add_argument('--apikey', type=str, help="Materials Commons user's apikey")
    parser.add_argument('--endpoint', type=str, help="Globus Endpoint")
    parser.add_argument('--base', type=str, help="Path on Globus Endpoint where ETL spreadsheet and data reside")
    parser.add_argument('--input', type=str, help="Input Spreadsheet File (path relative to base)")
    parser.add_argument('--data', type=str, help="Data Directory (path relative to base)")
    args = parser.parse_args(argv[1:])

    if not args.user:
        print("You must specify Materials Commons user id. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.apikey:
        print("You must specify the user's apikey. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.endpoint:
        print("You must specify a globus endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.base:
        print("You must specify a top-level (base) path on the globus endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.input:
        print("You must specify the path for the spreadsheet file (relative to the base path). Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.data:
        print("You must specify the path for the data directory (relative to the base path). Argument not found.")
        parser.print_help()
        exit(-1)

    generated_project = TestProject(args.apikey).get_project()

    if not generated_project.owner == args.user:
        print("Test project is not owned by {}. Please fix apikey ({}).").format(args.user, args.apikey)
        exit(-1)

    startup_log.info("Materials Commons user id = {}".format(args.user))
    startup_log.info("args: endpoint = {}; base = {}; input = {}; data={}"
                     .format(args.endpoint, args.base, args.input, args.data))
    startup_log.info("generated test project - name = {}; id = {}".
                     format(generated_project.name, generated_project.id))

    main(generated_project, args.user, args.endpoint, args.base, args.input, args.data)
