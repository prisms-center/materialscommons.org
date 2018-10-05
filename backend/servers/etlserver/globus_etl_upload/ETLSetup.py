import os
import logging
from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess
from ..common.McdirHelper import McdirHelper
from ..common.VerifySetup import VerifySetup
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface


class ETLSetup:
    def __init__(self, user_id):
        self.user_id = user_id
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.worker_base_path = McdirHelper().get_upload_dir()

    def setup_status_record(self, project_id, experiment_name, experiment_description,
                            globus_endpoint, globue_endpoint_base_path,
                            excel_file_path, data_dir_path):
        self.log.info("starting setup of status record; user_id = {}; project_id = {}"
                      .format(self.user_id, project_id))
        status_record = DatabaseInterface().\
            create_status_record(self.user_id, project_id, "ETL Process")

        status_record_id = status_record['id']
        self.log.info("status_record_id = {}".format(status_record_id))

        DatabaseInterface().update_status(status_record_id, BackgroundProcess.INITIALIZATION)

        base_path = self.worker_base_path
        transfer_dir = self.make_transfer_dir(status_record_id)
        transfer_base_path = os.path.join(base_path, transfer_dir)
        extras = {
            "experiment_name": experiment_name,
            "experiment_description": experiment_description,
            "transfer_dir": transfer_dir,
            "transfer_base_path": transfer_base_path,
            "globus_endpoint": globus_endpoint,
            "globus_path": globue_endpoint_base_path,
            "excel_file_path": excel_file_path,
            "data_dir_path": data_dir_path
        }
        self.log.info("status record: extras = {}".format(extras))
        status_record = DatabaseInterface().add_extras_data_to_status_record(status_record_id, extras)
        status_record_id = status_record['id']
        self.log.info("status record id = " + status_record_id)
        return status_record_id

    def verify_setup(self, status_record_id):
        results = self.verify_preconditions(status_record_id)
        if not results['status'] == 'SUCCESS':
            # here we return error message to user!
            self.log.error("Preconditions for transfer failed...")
            for key in results['messages']:
                self.log.error(" Failure: " + key + " :: " + results['messages'][key])
            return results
        self.log.debug(results)
        return results

    def verify_preconditions(self, status_record_id):
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.VERIFYING_SETUP)
        project_id = status_record['project_id']
        globus_endpoint = status_record['extras']['globus_endpoint']
        transfer_base_path = status_record['extras']['transfer_base_path']
        globue_endpoint_base_path = status_record['extras']['globue_endpoint_base_path']
        excel_file_path = status_record['extras']['excel_file_path']
        data_dir_path = status_record['extras']['data_dir_path']

        web_service = MaterialsCommonsGlobusInterface(self.user_id)

        globus_source_endpoint, globus_source_path,
        globus_destination_path, base_path, dir_file_list = None
        checker = VerifySetup(web_service, project_id,
                              globus_endpoint, globue_endpoint_base_path,
                              transfer_base_path,
                              endpoint_base_path=globue_endpoint_base_path,
                              file_dir_list=[excel_file_path, data_dir_path])
        return checker.status()

    @staticmethod
    def make_transfer_dir(status_record_id):
        return "transfer-{}".format(status_record_id)