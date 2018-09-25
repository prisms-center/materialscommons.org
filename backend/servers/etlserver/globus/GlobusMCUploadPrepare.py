import os
import logging
from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess
from ..common.McdirHelper import McdirHelper
from ..common.VerifySetup import VerifySetup
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface


class GlobusMCUploadPrepare:
    def __init__(self, mc_user_id):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.mc_user_id = mc_user_id
        self.project_id = None
        self.globus_endpoint = None
        self.endpoint_path = None
        self.worker_base_path = McdirHelper().get_upload_dir()
        self.log.info("init - done")

    def setup_non_etl(self, project_id, endpoint, path):
        self.project_id = project_id
        project = DatabaseInterface().get_project(project_id)
        project_name = (project['name'] if project else 'undefined')

        self.globus_endpoint = endpoint
        self.endpoint_path = path
        self.log.info("starting setup of status record; user_id = {}; project_id = {}"
                      .format(self.mc_user_id, self.project_id))
        status_record = DatabaseInterface(). \
            create_status_record(self.mc_user_id, self.project_id, "Non-ETL File Upload Process")

        status_record_id = status_record['id']
        self.log.info("status_record_id = {}".format(status_record_id))

        DatabaseInterface().update_status(status_record_id, BackgroundProcess.INITIALIZATION)

        base_path = self.worker_base_path
        transfer_dir = self.make_transfer_dir(status_record_id)
        globus_destination_path = self.make_globus_destination_path(transfer_dir)
        transfer_base_path = os.path.join(base_path, transfer_dir)
        self.log.info("transfer_dir = {}".format(transfer_dir))
        self.log.info("transfer_base_path = {}".format(transfer_base_path))
        self.log.info("globus_destination_path = {}".format(globus_destination_path))
        extras = {
            "transfer_base_path": transfer_base_path,
            "globus_endpoint": self.globus_endpoint,
            "globus_path": self.endpoint_path,
            "globus_destination_path": globus_destination_path,
            "label": "upload to project {}".format(project_name)
        }
        status_record = DatabaseInterface().add_extras_data_to_status_record(status_record_id, extras)
        status_record_id = status_record['id']
        self.log.info("status record id = " + status_record_id)

        mc_globus_interface = MaterialsCommonsGlobusInterface(self.mc_user_id)
        mc_globus_interface.setup_transfer_clients()
        mc_globus_interface.set_user_access_rule(globus_destination_path)

        return status_record_id

    def verify(self, status_record_id):
        results = self._verify_preconditions(status_record_id)
        if not results['status'] == 'SUCCESS':
            # here we return error message to user!
            self.log.error("Preconditions for transfer failed...")
            for key in results['messages']:
                self.log.error("  Failure: {} :: {}".format(key, results['messages'][key]))
            return results
        self.log.debug(results)
        return results

    def _verify_preconditions(self, status_record_id):
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.VERIFYING_SETUP)
        project_id = status_record['project_id']
        globus_source_endpoint = status_record['extras']['globus_endpoint']
        globus_path_path = status_record['extras']['globus_path']
        transfer_base_path = status_record['extras']['transfer_base_path']
        globus_destination_path = status_record['extras']['globus_destination_path']

        mc_globus_interface = MaterialsCommonsGlobusInterface(self.mc_user_id)
        checker = VerifySetup(mc_globus_interface, project_id,
                              globus_source_endpoint, globus_path_path,
                              globus_destination_path,
                              transfer_base_path,
                              [])
        return checker.status()

    @staticmethod
    def make_transfer_dir(status_record_id):
        return "transfer-{}".format(status_record_id)

    @staticmethod
    def make_globus_destination_path(transfer_dir_path):
        return '/{}/'.format(os.path.join("__upload_staging", transfer_dir_path))
