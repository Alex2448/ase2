from datetime import datetime
# from elasticsearch6 import Elasticsearch
from elasticsearch import Elasticsearch
import pandas as pd
import time
from scipy.stats import norm
import statsmodels.api as sm
# from statsmodels.iolib.smpickle import save_pickle, load_pickle
import pickle
import logging
from minio import Minio
import io

from opentelemetry import trace
from opentelemetry.exporter.jaeger.proto.grpc import JaegerExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

logging.basicConfig(level=logging.INFO)

#More info @ https://opentelemetry.io/docs/instrumentation/python/exporters/

#Can name your service anything, please attach group number at the end, i.e., service-name-<groupid>
trace.set_tracer_provider(
    TracerProvider(
        resource=Resource.create({SERVICE_NAME: "ow-function-model"})
    )
)

jaeger_exporter = JaegerExporter(
    collector_endpoint='138.246.234.236:14250',
    insecure=True
)

trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

tracer = trace.get_tracer(__name__)

minioAddress = "iot-minio-exposed.default.svc.cluster.local:9900"

#Connecting to MinIO
minioClient = Minio(minioAddress,
                access_key='<minio-id>',
                secret_key='<minio-pwd>',
                secure=False)
                
logging.info(f"Minioclient: {minioClient}")

def main(request):
    elastic_search_host = "http://<es-user>:<es-pwd>@iot-elasticsearch.default.svc.cluster.local:9200"
    client = Elasticsearch(
        elastic_search_host,
    )
    es_query = { "query" : {
    "match_all": {}
        }
    }
    #Please attach group-id to spans, e.g. getesdata-group2
    with tracer.start_as_current_span("getesdata"):
        result = client.search(index="<index>", body=es_query, size=10000, scroll="5m")
        with tracer.start_as_current_span("parseesdata"):
            df = parse_data(result)
            with tracer.start_as_current_span("trainmodel"):
                model = test_model(df)
                with tracer.start_as_current_span("savemodel"):
                    # save_pickle(model, "/tmp/test_model.pkl")
                    bytes_file = pickle.dumps(model)
                    #Connecting to MinIO 
                    buckets = minioClient.list_buckets()
                    for bucket in buckets:
                        # print(bucket.name, bucket.creation_date)
                        logging.info(f"BucketName: {bucket.name}, CreationDate: {bucket.creation_date}")

                    #Storing Model
                    result = minioClient.put_object(
                        bucket_name="<bucket-name>", 
                        object_name="<file-name>", 
                        data=io.BytesIO(bytes_file), 
                        length= len(bytes_file)
                    )
                    print(
                        "created {0} object; etag: {1}, version-id: {2}".format(
                        result.object_name, result.etag, result.version_id,
                        ),
                    )
    return {"result":"done"}

def test_model(df):
    mod = sm.tsa.statespace.SARIMAX(df['SensorValues'], trend='c', order=(1,1,(1,0,0,1)))
    model = mod.fit(disp=False)
    # logging.info(f'{model.summary()}')
    return model

def parse_data(json_data):
    
    time_values = []
    sensor_values = []
    scroll_id = json_data["_scroll_id"]
    total_data_values = json_data["hits"]["total"]
    logging.info(f'Scroll ID: {scroll_id}')
    logging.info(f'Total Data Values: {total_data_values}')

    data_values = json_data["hits"]["hits"]
    for i in range(0, len(data_values)):
        timestamp = data_values[i]["_source"]["timestamp"]
        data_value = float(data_values[i]["_source"]["value"])
        timestamp_converted = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(timestamp))
        # logging.info(f'TimeStamp: {timestamp}')
        # logging.info(f'TimeStamp Converted: {timestamp_converted}')
        # logging.info(f'Value: {data_value}')
        time_values.append(timestamp_converted)
        sensor_values.append(data_value)
    df = pd.DataFrame(
        {
            "TimeStamps": time_values,
            "SensorValues": sensor_values
        }
    )

    return df


