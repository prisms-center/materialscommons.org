import argparse
import sys
import logging

from globus_sdk.exc import GlobusAPIError

from materials_commons.api import get_all_projects

from ..globus_upload.GlobusNonEtlUpload import GlobusNonEtlUpload

def main(project, globus_endpoint):
    main_log = logging.getLogger("main")
    main_log.info("Starting all file Globus upload. Project = {} ({})".
                  format(project.name, project.id))
    try:
        main_log.info("Starting GlobusNonEtlUpload")
        upload = GlobusNonEtlUpload(project.owner, project.id, globus_endpoint)
        upload.initialize()
        upload.start()
        while upload.is_running():
            main_log.info("In-line monitoring of upload: {}".format(upload.get_last_status()))
        main_log.info("Done.")
    except GlobusAPIError as error:
        http_status = error.http_status
        code = error.code
        details = error.message
        message = "Unable to connect to the Globus Connection server (based on configuration information): "
        message += " http_status = " + str(http_status)
        message += ", code = " + code
        message += ", message = " + details
        main_log.error(message)


if __name__ == "__main__":

    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    local_log = logging.getLogger("main-setup")

    # suppress info logging for globus_sdk loggers that are invoked, while leaving my info logging in place
    logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                   'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                   'globus_sdk.transfer.paging', 'globus_sdk.config', 'globus_sdk.exc',
                   'globus_sdk.transfer.data', 'globus_sdk.auth', 'globus_sdk.authorizers',
                   'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient',
                   'urllib3.connectionpool']
    for name in logger_list:
        logging.getLogger(name).setLevel(logging.ERROR)

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test of Globus non-ETL upload')
    parser.add_argument('--name', type=str, help="Project Name")
    parser.add_argument('--endpoint', type=str, help="Globus shared endpoint id")
    args = parser.parse_args(argv[1:])
    if not args.name:
        print("You must specify a unique project name, or name substring. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.endpoint:
        print("You must specify a globus shared endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    local_log.info("Searching for project with name-match = {}".format(args.name))
    project_list = get_all_projects()

    project_selected = None
    for probe in project_list:
        if args.name in probe.name:
            if project_selected:
                print("Found multiple matches for {}".format(args.name))
                print("You must specify a unique project name, or name substring.")
                parser.print_help()
                exit(-1)
            project_selected = probe

    if not project_selected:
        print("Found no matches for {}".format(args.name))
        print("You must specify a unique project name, or name substring.")
        parser.print_help()
        exit(-1)

    local_log.info("Found match with name-match = {}; project.name = {}; id = {}".
                   format(args.name, project_selected.name, project_selected.id))

    main(project_selected, args.endpoint)
